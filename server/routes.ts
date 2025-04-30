import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import Papa from "papaparse";
import { z } from "zod";
import { meetingCSVSchema, type MeetingCSV, type Meeting } from "@shared/schema";

// Extended request type that includes multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all routes with /api
  const apiRouter = app.route("/api");

  // Get meeting analytics
  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getMeetingAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch meeting analytics" });
    }
  });

  // Get all meetings
  app.get("/api/meetings", async (req: Request, res: Response) => {
    try {
      const meetings = await storage.getMeetings();
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get a specific meeting
  app.get("/api/meetings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      const meeting = await storage.getMeeting(id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json(meeting);
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Upload CSV and process meetings
  app.post("/api/meetings/upload", upload.single("file"), async (req: MulterRequest, res: Response) => {
    try {
      console.log("Received upload request, file:", req.file ? "yes" : "no");
      console.log("Body:", req.body);
      
      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      console.log("File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Parse CSV file
      const csvText = req.file.buffer.toString("utf8");
      console.log("CSV text sample:", csvText.substring(0, 100) + "...");
      
      // Parse the CSV file
      const parseResult = Papa.parse<Record<string, any>>(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        // Be more lenient with quotes, headers, etc.
        comments: "#",  // Ignore rows starting with #
        quoteChar: '"',
        escapeChar: '"',
        delimiter: "," // Explicitly set comma delimiter
      });
      
      console.log("Parse result:", { 
        rowCount: parseResult.data.length,
        errorCount: parseResult.errors?.length || 0,
        fields: parseResult.meta.fields
      });

      if (parseResult.errors && parseResult.errors.length > 0) {
        console.error("CSV parsing errors:", parseResult.errors);
        return res.status(400).json({ 
          message: "CSV parsing error",
          errors: parseResult.errors 
        });
      }

      // Validate and transform CSV data
      const validatedRows: MeetingCSV[] = [];
      const errors: string[] = [];

      // Log the first few rows of the raw data to help debug
      console.log("First row sample before processing:", parseResult.data[0]);
      
      for (let i = 0; i < parseResult.data.length; i++) {
        const row = parseResult.data[i];
        try {
          // Skip empty rows or invalid rows
          if (!row || typeof row !== 'object' || row === null) {
            console.log(`Skipping row ${i + 1}: Empty or invalid row`);
            continue;
          }
          
          // Sanitize field names - some CSV files might have whitespace in headers
          const sanitizedRow: Record<string, any> = {};
          for (const [key, value] of Object.entries(row)) {
            sanitizedRow[key.trim()] = value;
          }
          
          // Make sure all required fields exist with fallbacks
          const processedRow = {
            Meeting_Title: (sanitizedRow.Meeting_Title || '').toString(),
            Duration_Minutes: sanitizedRow.Duration_Minutes || 0,
            Participants: sanitizedRow.Participants || 0,
            Actual_Speakers: sanitizedRow.Actual_Speakers || 0,
            Decision_Made: sanitizedRow.Decision_Made || false,
            Agenda_Provided: sanitizedRow.Agenda_Provided || false,
            Follow_Up_Sent: sanitizedRow.Follow_Up_Sent || false,
            Could_Be_Async: sanitizedRow.Could_Be_Async || false
          };
          
          // Now validate with our schema
          const validRow = meetingCSVSchema.parse(processedRow);
          validatedRows.push(validRow);
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error(`Validation error in row ${i + 1}:`, error.message);
            errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            console.error(`Unknown error in row ${i + 1}:`, error);
            errors.push(`Row ${i + 1}: Invalid data`);
          }
        }
      }

      console.log("Validation results:", {
        validRows: validatedRows.length,
        errors: errors.length
      });

      if (errors.length > 0 && validatedRows.length === 0) {
        return res.status(400).json({
          message: "CSV validation failed",
          errors
        });
      }

      // Clear existing meetings if requested
      const shouldClear = req.body.clearExisting === "true";
      console.log("Should clear existing meetings:", shouldClear);
      
      if (shouldClear) {
        await storage.clearMeetings();
      }

      // Create meetings from CSV data
      const meetings = await storage.createMeetingsFromCSV(validatedRows);
      console.log(`Successfully created ${meetings.length} meetings from CSV`);

      res.json({ 
        message: "Meetings imported successfully",
        count: meetings.length,
        warnings: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Error processing CSV:", error);
      res.status(500).json({ message: "Failed to process meeting data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

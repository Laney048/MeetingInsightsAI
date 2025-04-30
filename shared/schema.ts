import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  participants: integer("participants").notNull(),
  actualSpeakers: integer("actual_speakers").notNull(),
  decisionMade: boolean("decision_made").notNull(),
  agendaProvided: boolean("agenda_provided").notNull(),
  followUpSent: boolean("follow_up_sent").notNull(),
  couldBeAsync: boolean("could_be_async").notNull(),
  date: timestamp("date").notNull(),
  usefulnessScore: integer("usefulness_score").notNull(), // Percentage score (0-100)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// CSV validation schema
export const meetingCSVSchema = z.object({
  Meeting_Title: z.string(),
  Duration_Minutes: z.coerce.number(),
  Participants: z.coerce.number(),
  Actual_Speakers: z.coerce.number(),
  Decision_Made: z.string().transform(val => 
    val.toLowerCase() === 'yes' || val.toLowerCase() === 'true' || val === '1'
  ),
  Agenda_Provided: z.string().transform(val => 
    val.toLowerCase() === 'yes' || val.toLowerCase() === 'true' || val === '1'
  ),
  Follow_Up_Sent: z.string().transform(val => 
    val.toLowerCase() === 'yes' || val.toLowerCase() === 'true' || val === '1'
  ),
  Could_Be_Async: z.string().transform(val => 
    val.toLowerCase() === 'yes' || val.toLowerCase() === 'true' || val === '1'
  ),
});

export type MeetingCSV = z.infer<typeof meetingCSVSchema>;

// Analytics types
export type MeetingSummary = {
  totalMeetings: number;
  usefulMeetings: number;
  usefulMeetingsPercentage: number;
  timeSavedHours: number;
  asyncCandidates: number;
  hoursPerWeek: number;
};

export type MeetingMetrics = {
  decisionsPercentage: number;
  actionsPercentage: number;
  agendasPercentage: number;
  followUpsPercentage: number;
  asyncPercentage: number;
};

export type TrendData = {
  week: string;
  usefulnessPercentage: number;
};

export type MeetingRecommendation = {
  id: number;
  title: string;
  durationMinutes: number;
  participants: number;
  recommendationType: 'decline' | 'async' | 'optimize';
  reason: string;
  suggestion?: string;
};

export type MeetingAnalytics = {
  summary: MeetingSummary;
  metrics: MeetingMetrics;
  trends: TrendData[];
  recommendations: MeetingRecommendation[];
  meetings: Meeting[];
};

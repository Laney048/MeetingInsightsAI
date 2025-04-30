import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadIcon, FileTextIcon, AlertCircleIcon, XIcon, CheckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FileUpload = ({ open, onOpenChange }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [clearExisting, setClearExisting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Accept any file with .csv extension regardless of type
      if (selectedFile.name.endsWith('.csv')) {
        console.log("File selected:", selectedFile.name);
        setFile(selectedFile);
        setErrors([]);
      } else {
        console.log("Invalid file type:", selectedFile.type);
        setFile(null);
        setErrors(["Please select a file with .csv extension"]);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrors(["Please select a file to upload"]);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);
    
    try {
      // Create a simple FormData object to hold the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clearExisting", clearExisting.toString());
      
      // Simulate uploading (will be replaced by real progress later)
      const uploadTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 200);
      
      // Send the file to the server
      const response = await fetch("/api/meetings/upload", {
        method: "POST",
        body: formData
      });
      
      // Stop the progress animation
      clearInterval(uploadTimer);
      setUploadProgress(100);
      
      // Handle the response
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to upload file";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the JSON, just use the text
          if (errorText) errorMessage = errorText;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      const result = await response.json();
      
      // Show success message
      toast({
        title: "Upload successful",
        description: `Imported ${result.count} meetings.${result.warnings ? " Some rows had errors." : ""}`,
      });
      
      // Refresh data on the page
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      
      // Reset and close the dialog
      setTimeout(() => {
        setIsUploading(false);
        setFile(null);
        setUploadProgress(0);
        onOpenChange(false);
      }, 1000);
      
    } catch (error) {
      setUploadProgress(0);
      setIsUploading(false);
      
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      setErrors([errorMessage]);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload meeting data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your meeting data to analyze effectiveness.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!file ? (
            <form className="w-full">
              <div 
                className="border-2 border-dashed border-muted rounded-lg p-6 text-center"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('border-primary');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-primary');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-primary');
                  
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const droppedFile = e.dataTransfer.files[0];
                    console.log("File dropped:", droppedFile.name, droppedFile.type);
                    
                    // Accept any CSV file regardless of mimetype
                    if (droppedFile.name.endsWith('.csv')) {
                      setFile(droppedFile);
                      setErrors([]);
                    } else {
                      setErrors(["Please drop a valid CSV file"]);
                    }
                  }
                }}
              >
                <FileTextIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Drag & drop your CSV file</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Or click to browse files
                </p>
                <div className="flex flex-col space-y-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mx-auto"
                    onClick={() => {
                      // Create a temporary file input
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv';
                      
                      // Add change handler
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files.length > 0) {
                          const selectedFile = target.files[0];
                          if (selectedFile.name.endsWith('.csv')) {
                            setFile(selectedFile);
                            setErrors([]);
                          } else {
                            setErrors(['Please select a file with .csv extension']);
                          }
                        }
                      };
                      
                      // Trigger click to open file dialog
                      input.click();
                    }}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Select CSV File
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or use sample file
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="mx-auto"
                    onClick={async () => {
                      try {
                        // Fetch the sample CSV file from the attached assets
                        const response = await fetch('/attached_assets/week%202%20-%20Problem_2_-_Meeting_Usefulness_Tracker.csv');
                        if (!response.ok) throw new Error('Failed to load sample file');
                        
                        // Convert the response to a blob
                        const data = await response.blob();
                        
                        // Create a File object from the blob
                        const sampleFile = new File([data], 'sample-meetings.csv', { type: 'text/csv' });
                        
                        // Set the file in the state
                        setFile(sampleFile);
                        setErrors([]);
                      } catch (error) {
                        console.error('Error loading sample file:', error);
                        setErrors(['Failed to load sample file. Please try uploading manually.']);
                      }
                    }}
                  >
                    Use Sample Data
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileTextIcon className="h-6 w-6 text-primary mr-2" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {isUploading && (
                <div className="mb-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
              
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="clear-existing" 
                  checked={clearExisting}
                  onCheckedChange={(checked) => setClearExisting(!!checked)}
                  disabled={isUploading}
                />
                <Label htmlFor="clear-existing" className="text-sm">
                  Replace existing data
                </Label>
              </div>
              
              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          )}
          
          {errors.length > 0 && (
            <div className="bg-destructive/10 p-3 rounded-md">
              <div className="flex items-start">
                <AlertCircleIcon className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Upload Error</p>
                  <ul className="text-xs space-y-1 mt-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Expected CSV format:</p>
            <p>Meeting_Title, Duration_Minutes, Participants, Actual_Speakers, Decision_Made, Agenda_Provided, Follow_Up_Sent, Could_Be_Async</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;

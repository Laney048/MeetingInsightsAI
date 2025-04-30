import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Check, 
  X, 
  MessageSquare,
  Calendar,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { format } from "date-fns";

export default function MeetingDetails() {
  const [match, params] = useRoute("/meetings/:id");
  const { toast } = useToast();
  
  const { data: meeting, isLoading } = useQuery({
    queryKey: [`/api/meetings/${params?.id}`],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-20 mr-4" />
          <Skeleton className="h-6 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-4 lg:p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-center">Meeting not found</h2>
            <p className="text-center mt-2 text-muted-foreground">
              The meeting you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate score class
  const getScoreClass = (score: number) => {
    if (score >= 70) return "bg-success-light text-success";
    if (score >= 40) return "bg-warning-light text-warning";
    return "bg-danger-light text-danger";
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{meeting.title}</h1>
        <div className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${getScoreClass(meeting.usefulnessScore)}`}>
          {meeting.usefulnessScore}% Useful
        </div>
      </div>
      
      {/* Meeting Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">Date</span>
            </div>
            <p className="mt-2 text-lg font-semibold">
              {format(new Date(meeting.date), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="mt-2 text-lg font-semibold">
              {meeting.durationMinutes} minutes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">Participants</span>
            </div>
            <p className="mt-2 text-lg font-semibold">
              {meeting.participants} ({meeting.actualSpeakers} speakers)
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Meeting Details */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Key Metrics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Agenda Provided</span>
                  </div>
                  {meeting.agendaProvided ? (
                    <Badge variant="outline" className="bg-success-light text-success border-0">
                      <Check className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-danger-light text-danger border-0">
                      <X className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Decisions Made</span>
                  </div>
                  {meeting.decisionMade ? (
                    <Badge variant="outline" className="bg-success-light text-success border-0">
                      <Check className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-danger-light text-danger border-0">
                      <X className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Follow-up Sent</span>
                  </div>
                  {meeting.followUpSent ? (
                    <Badge variant="outline" className="bg-success-light text-success border-0">
                      <Check className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-danger-light text-danger border-0">
                      <X className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Improvement Suggestions</h3>
              
              <div className="space-y-3">
                {meeting.usefulnessScore < 70 && (
                  <div className="border rounded-md p-3">
                    {!meeting.agendaProvided && (
                      <p className="text-sm">• Provide a clear agenda before the meeting</p>
                    )}
                    
                    {!meeting.decisionMade && (
                      <p className="text-sm">• Focus on making concrete decisions during the meeting</p>
                    )}
                    
                    {!meeting.followUpSent && (
                      <p className="text-sm">• Send follow-up notes with action items after the meeting</p>
                    )}
                    
                    {meeting.actualSpeakers / meeting.participants < 0.5 && (
                      <p className="text-sm">• Encourage more participant engagement ({meeting.actualSpeakers} of {meeting.participants} spoke)</p>
                    )}
                    
                    {meeting.durationMinutes > 60 && (
                      <p className="text-sm">• Consider shortening the meeting duration (currently {meeting.durationMinutes} minutes)</p>
                    )}
                    
                    {meeting.couldBeAsync && (
                      <p className="text-sm">• This meeting could potentially be handled asynchronously</p>
                    )}
                  </div>
                )}
                
                {meeting.usefulnessScore >= 70 && (
                  <div className="border border-success/30 rounded-md p-3 bg-success/5">
                    <p className="text-sm text-success font-medium">This was a high-value meeting! Keep up the good practices.</p>
                  </div>
                )}
                
                <Button
                  onClick={() => {
                    toast({
                      title: "Report generated",
                      description: "Meeting analysis report has been sent to your email.",
                    });
                  }}
                >
                  Generate Detailed Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@shared/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface MeetingScoreProps {
  score: number;
}

const MeetingScore = ({ score }: MeetingScoreProps) => {
  let dotClass = 'meeting-score-low';
  if (score >= 70) dotClass = 'meeting-score-high';
  else if (score >= 40) dotClass = 'meeting-score-medium';

  return (
    <div className="flex items-center">
      <div className={`meeting-score-dot ${dotClass}`}></div>
      <span className="text-sm font-medium">{score}%</span>
    </div>
  );
};

interface MeetingTableProps {
  meetings?: Meeting[];
}

const MeetingTable = ({ meetings = [] }: MeetingTableProps) => {
  const [, setLocation] = useLocation();

  const handleViewDetails = (id: number) => {
    setLocation(`/meetings/${id}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b">
        <CardTitle className="text-lg font-semibold">Recent Meetings</CardTitle>
        <Button variant="ghost" className="text-primary font-medium text-sm">View All</Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Meeting</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Decisions</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {meetings.length > 0 ? (
              meetings.slice(0, 5).map((meeting) => (
                <tr key={meeting.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {meeting.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(meeting.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {meeting.durationMinutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {meeting.decisionMade ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {meeting.followUpSent ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <MeetingScore score={meeting.usefulnessScore} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button 
                      variant="ghost" 
                      className="text-primary font-medium"
                      onClick={() => handleViewDetails(meeting.id)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                  No meetings found. Upload a CSV file to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MeetingTable;

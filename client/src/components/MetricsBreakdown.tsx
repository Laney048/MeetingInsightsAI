import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingMetrics } from "@shared/schema";
import { ChevronRight } from "lucide-react";

interface MetricProgressProps {
  label: string;
  value: number;
}

const MetricProgress = ({ label, value }: MetricProgressProps) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-muted-foreground">{value}%</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div 
        className="bg-primary rounded-full h-2" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

interface MetricsBreakdownProps {
  metrics?: MeetingMetrics;
}

const MetricsBreakdown = ({ metrics }: MetricsBreakdownProps) => {
  if (!metrics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Meeting Metrics Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricProgress label="Decisions Made" value={metrics.decisionsPercentage} />
        <MetricProgress label="Action Items Assigned" value={metrics.actionsPercentage} />
        <MetricProgress label="Agendas Provided" value={metrics.agendasPercentage} />
        <MetricProgress label="Follow-ups Sent" value={metrics.followUpsPercentage} />
        <MetricProgress label="Async Candidates" value={metrics.asyncPercentage} />
        
        <div className="pt-3 mt-4 border-t border-border">
          <Button variant="ghost" className="text-primary font-medium text-sm px-0">
            <span>View Detailed Analysis</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsBreakdown;

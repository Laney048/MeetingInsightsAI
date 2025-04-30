import { Card } from "@/components/ui/card";
import { type MeetingSummary } from "@shared/schema";

interface ScoreIndicatorProps {
  value: number | string;
  type: 'high' | 'medium' | 'low';
}

const ScoreIndicator = ({ value, type }: ScoreIndicatorProps) => (
  <div className={`score-indicator score-${type}`}>
    {value}
  </div>
);

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  indicator: {
    value: string | number;
    type: 'high' | 'medium' | 'low';
  };
}

const SummaryCard = ({ title, value, subtitle, indicator }: SummaryCardProps) => (
  <Card className="p-5">
    <div className="flex justify-between items-start mb-3">
      <span className="text-muted-foreground font-medium">{title}</span>
      <ScoreIndicator value={indicator.value} type={indicator.type} />
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    <p className="text-muted-foreground text-sm">{subtitle}</p>
  </Card>
);

interface SummaryCardsProps {
  summary?: MeetingSummary;
}

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  if (!summary) return null;

  const scoreTotalMeetings = summary.totalMeetings > 10 ? 'high' : summary.totalMeetings > 5 ? 'medium' : 'low';
  const scoreUsefulMeetings = summary.usefulMeetingsPercentage > 70 ? 'high' : summary.usefulMeetingsPercentage > 40 ? 'medium' : 'low';
  const scoreTimeSaved = summary.timeSavedHours > 5 ? 'high' : summary.timeSavedHours > 2 ? 'medium' : 'low';
  const scoreAsyncCandidates = summary.asyncCandidates > 5 ? 'high' : summary.asyncCandidates > 2 ? 'medium' : 'low';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Meetings"
        value={summary.totalMeetings}
        subtitle={`${summary.hoursPerWeek} hours per week`}
        indicator={{ value: summary.totalMeetings, type: scoreTotalMeetings }}
      />
      
      <SummaryCard
        title="Useful Meetings"
        value={`${summary.usefulMeetingsPercentage}%`}
        subtitle={`Only ${summary.usefulMeetings} of ${summary.totalMeetings} meetings were valuable`}
        indicator={{ value: summary.usefulMeetings, type: scoreUsefulMeetings }}
      />
      
      <SummaryCard
        title="Time Saved"
        value={`${summary.timeSavedHours} hours`}
        subtitle="This month by declining low-value meetings"
        indicator={{ value: `${summary.timeSavedHours}h`, type: scoreTimeSaved }}
      />
      
      <SummaryCard
        title="Async Potential"
        value={`${summary.asyncCandidates} meetings`}
        subtitle="Could be replaced with async communication"
        indicator={{ value: summary.asyncCandidates, type: scoreAsyncCandidates }}
      />
    </div>
  );
};

export default SummaryCards;

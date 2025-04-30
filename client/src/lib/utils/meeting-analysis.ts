import { Meeting } from "@shared/schema";

// Function to determine score class based on meeting usefulness score
export function getScoreClass(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// Function to get score indicator value based on a numeric value and thresholds
export function getScoreIndicator(value: number, options: {
  highThreshold: number,
  mediumThreshold: number,
}): { value: number | string; type: 'high' | 'medium' | 'low' } {
  const type = value >= options.highThreshold 
    ? 'high' 
    : value >= options.mediumThreshold 
      ? 'medium' 
      : 'low';
  
  return { value, type };
}

// Format minutes as hours and minutes
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} min`;
  } else if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
  }
}

// Calculate meeting efficiency score
export function calculateMeetingEfficiency(meeting: Meeting): number {
  let score = 0;
  const maxScore = 100;
  
  // Decision made is a major factor
  if (meeting.decisionMade) score += 30;
  
  // Speaker engagement (more speakers = more engagement)
  const speakerRatio = meeting.actualSpeakers / meeting.participants;
  if (speakerRatio > 0.7) score += 20;
  else if (speakerRatio > 0.5) score += 15;
  else if (speakerRatio > 0.3) score += 10;
  
  // Agenda and follow-up show organization
  if (meeting.agendaProvided) score += 15;
  if (meeting.followUpSent) score += 15;
  
  // If the meeting could be async, that's not great for the score
  if (meeting.couldBeAsync) score -= 15;
  
  // Duration and participant factors
  if (meeting.durationMinutes <= 30) score += 10;
  else if (meeting.durationMinutes > 90) score -= 10;
  
  if (meeting.participants <= 5) score += 10;
  else if (meeting.participants > 15) score -= 10;
  
  // Ensure score is within 0-100
  return Math.max(0, Math.min(maxScore, score));
}

import { 
  users, type User, type InsertUser,
  meetings, type Meeting, type InsertMeeting,
  type MeetingCSV, type MeetingAnalytics, type MeetingSummary, 
  type MeetingMetrics, type TrendData, type MeetingRecommendation
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meeting methods
  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  createMeetingsFromCSV(meetingsData: MeetingCSV[]): Promise<Meeting[]>;
  clearMeetings(): Promise<void>;
  
  // Analytics methods
  getMeetingAnalytics(): Promise<MeetingAnalytics>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetingsMap: Map<number, Meeting>;
  private userCurrentId: number;
  private meetingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.meetingsMap = new Map();
    this.userCurrentId = 1;
    this.meetingCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetingsMap.values());
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetingsMap.get(id);
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingCurrentId++;
    const newMeeting: Meeting = { ...meeting, id };
    this.meetingsMap.set(id, newMeeting);
    return newMeeting;
  }

  async createMeetingsFromCSV(meetingsData: MeetingCSV[]): Promise<Meeting[]> {
    const createdMeetings: Meeting[] = [];
    
    for (const data of meetingsData) {
      // Calculate a usefulness score based on the meeting data
      const usefulnessScore = this.calculateUsefulnessScore({
        durationMinutes: data.Duration_Minutes,
        participants: data.Participants,
        speakerRatio: data.Actual_Speakers / data.Participants,
        decisionMade: data.Decision_Made,
        agendaProvided: data.Agenda_Provided,
        followUpSent: data.Follow_Up_Sent,
        couldBeAsync: data.Could_Be_Async
      });
      
      // Generate a random date within the last month
      const now = new Date();
      const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.floor(Math.random() * 30));
      
      const meeting: InsertMeeting = {
        title: data.Meeting_Title,
        durationMinutes: data.Duration_Minutes,
        participants: data.Participants,
        actualSpeakers: data.Actual_Speakers,
        decisionMade: data.Decision_Made,
        agendaProvided: data.Agenda_Provided,
        followUpSent: data.Follow_Up_Sent,
        couldBeAsync: data.Could_Be_Async,
        usefulnessScore,
        date: pastDate
      };
      
      const createdMeeting = await this.createMeeting(meeting);
      createdMeetings.push(createdMeeting);
    }
    
    return createdMeetings;
  }

  async clearMeetings(): Promise<void> {
    this.meetingsMap.clear();
    this.meetingCurrentId = 1;
  }

  async getMeetingAnalytics(): Promise<MeetingAnalytics> {
    const meetings = await this.getMeetings();
    
    // Calculate summary metrics
    const summary = this.calculateSummary(meetings);
    
    // Calculate metric percentages
    const metrics = this.calculateMetrics(meetings);
    
    // Generate trend data by week
    const trends = this.calculateTrends(meetings);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(meetings);
    
    return {
      summary,
      metrics,
      trends,
      recommendations,
      meetings
    };
  }

  private calculateUsefulnessScore(params: {
    durationMinutes: number,
    participants: number,
    speakerRatio: number,
    decisionMade: boolean,
    agendaProvided: boolean,
    followUpSent: boolean,
    couldBeAsync: boolean
  }): number {
    // This is a simplified algorithm to calculate meeting usefulness
    let score = 50; // Base score
    
    // Decision made is a major factor
    if (params.decisionMade) score += 25;
    else score -= 15;
    
    // Speaker ratio (more speakers = more engagement)
    if (params.speakerRatio > 0.7) score += 15;
    else if (params.speakerRatio > 0.5) score += 10;
    else if (params.speakerRatio > 0.3) score += 5;
    else score -= 10;
    
    // Agenda and follow-up show organization
    if (params.agendaProvided) score += 10;
    if (params.followUpSent) score += 10;
    
    // If the meeting could be async, that's not great for the score
    if (params.couldBeAsync) score -= 15;
    
    // Duration factor - penalize very long meetings
    if (params.durationMinutes > 60) score -= 5;
    if (params.durationMinutes > 90) score -= 10;
    
    // Too many participants can be inefficient
    if (params.participants > 10) score -= 5;
    if (params.participants > 15) score -= 10;
    
    // Ensure score is within 0-100
    return Math.max(0, Math.min(100, score));
  }

  private calculateSummary(meetings: Meeting[]): MeetingSummary {
    const totalMeetings = meetings.length;
    
    // Meetings with a score of 70 or higher are considered useful
    const usefulMeetings = meetings.filter(m => m.usefulnessScore >= 70).length;
    
    // Calculate percentage of useful meetings
    const usefulMeetingsPercentage = totalMeetings > 0 
      ? Math.round((usefulMeetings / totalMeetings) * 100) 
      : 0;
    
    // Meetings that could be replaced with async communication
    const asyncCandidates = meetings.filter(m => m.couldBeAsync).length;
    
    // Calculate time saved (assuming declined low-value meetings)
    const lowValueMeetings = meetings.filter(m => m.usefulnessScore < 50);
    const timeSavedMinutes = lowValueMeetings.reduce((sum, m) => sum + m.durationMinutes, 0);
    const timeSavedHours = Math.round(timeSavedMinutes / 6) / 10; // Round to 1 decimal
    
    // Calculate average meeting time per week (assuming 4 weeks of data)
    const totalMinutes = meetings.reduce((sum, m) => sum + m.durationMinutes, 0);
    const hoursPerWeek = Math.round((totalMinutes / 60 / 4) * 10) / 10; // Round to 1 decimal
    
    return {
      totalMeetings,
      usefulMeetings,
      usefulMeetingsPercentage,
      timeSavedHours,
      asyncCandidates,
      hoursPerWeek
    };
  }

  private calculateMetrics(meetings: Meeting[]): MeetingMetrics {
    const totalCount = meetings.length;
    if (totalCount === 0) {
      return {
        decisionsPercentage: 0,
        actionsPercentage: 0,
        agendasPercentage: 0,
        followUpsPercentage: 0,
        asyncPercentage: 0
      };
    }
    
    const decisionsCount = meetings.filter(m => m.decisionMade).length;
    const agendasCount = meetings.filter(m => m.agendaProvided).length;
    const followUpsCount = meetings.filter(m => m.followUpSent).length;
    const asyncCount = meetings.filter(m => m.couldBeAsync).length;
    
    // For actions, we'll use a combination of decisions and follow-ups as a proxy
    const actionsCount = meetings.filter(m => m.decisionMade || m.followUpSent).length;
    
    return {
      decisionsPercentage: Math.round((decisionsCount / totalCount) * 100),
      actionsPercentage: Math.round((actionsCount / totalCount) * 100),
      agendasPercentage: Math.round((agendasCount / totalCount) * 100),
      followUpsPercentage: Math.round((followUpsCount / totalCount) * 100),
      asyncPercentage: Math.round((asyncCount / totalCount) * 100)
    };
  }

  private calculateTrends(meetings: Meeting[]): TrendData[] {
    // Group meetings by week
    const meetingsByWeek = new Map<number, Meeting[]>();
    
    meetings.forEach(meeting => {
      const weekNumber = this.getWeekNumber(meeting.date);
      if (!meetingsByWeek.has(weekNumber)) {
        meetingsByWeek.set(weekNumber, []);
      }
      meetingsByWeek.get(weekNumber)?.push(meeting);
    });
    
    // Sort weeks and get the last 4 weeks (or fewer if not enough data)
    const sortedWeeks = Array.from(meetingsByWeek.keys()).sort((a, b) => a - b);
    const relevantWeeks = sortedWeeks.slice(-4); // Last 4 weeks
    
    // Calculate average usefulness score for each week
    return relevantWeeks.map((weekNumber, index) => {
      const weekMeetings = meetingsByWeek.get(weekNumber) || [];
      const totalScore = weekMeetings.reduce((sum, m) => sum + m.usefulnessScore, 0);
      const averageScore = weekMeetings.length > 0 ? Math.round(totalScore / weekMeetings.length) : 0;
      
      return {
        week: `W${index + 1}`,
        usefulnessPercentage: averageScore
      };
    });
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private generateRecommendations(meetings: Meeting[]): MeetingRecommendation[] {
    const recommendations: MeetingRecommendation[] = [];
    
    // Recommend declining very low-value meetings
    const meetingsToDecline = meetings
      .filter(m => m.usefulnessScore < 30)
      .slice(0, 2); // Limit to 2 recommendations
    
    meetingsToDecline.forEach(meeting => {
      recommendations.push({
        id: meeting.id,
        title: meeting.title,
        durationMinutes: meeting.durationMinutes,
        participants: meeting.participants,
        recommendationType: 'decline',
        reason: `Low usefulness score (${meeting.usefulnessScore}%) with no decisions made`
      });
    });
    
    // Recommend making async for meetings that could be async and have low engagement
    const meetingsToMakeAsync = meetings
      .filter(m => m.couldBeAsync && m.actualSpeakers / m.participants < 0.3)
      .filter(m => !meetingsToDecline.some(d => d.id === m.id)) // Don't duplicate
      .slice(0, 2); // Limit to 2 recommendations
    
    meetingsToMakeAsync.forEach(meeting => {
      recommendations.push({
        id: meeting.id,
        title: meeting.title,
        durationMinutes: meeting.durationMinutes,
        participants: meeting.participants,
        recommendationType: 'async',
        reason: `Only ${meeting.actualSpeakers} of ${meeting.participants} people speak, could be handled asynchronously`
      });
    });
    
    // Recommend optimizing meetings that are long with many participants
    const meetingsToOptimize = meetings
      .filter(m => m.durationMinutes > 60 && m.participants > 10 && m.usefulnessScore < 70)
      .filter(m => !meetingsToDecline.some(d => d.id === m.id) && !meetingsToMakeAsync.some(a => a.id === m.id))
      .slice(0, 2); // Limit to 2 recommendations
    
    meetingsToOptimize.forEach(meeting => {
      let suggestion = '';
      
      if (!meeting.agendaProvided) {
        suggestion = 'Add a clear agenda';
      } else if (meeting.participants > 15) {
        suggestion = `Reduce attendance to key stakeholders (currently ${meeting.participants})`;
      } else {
        suggestion = `Reduce meeting time (currently ${meeting.durationMinutes} minutes)`;
      }
      
      recommendations.push({
        id: meeting.id,
        title: meeting.title,
        durationMinutes: meeting.durationMinutes,
        participants: meeting.participants,
        recommendationType: 'optimize',
        reason: `Meeting has moderate usefulness (${meeting.usefulnessScore}%)`,
        suggestion
      });
    });
    
    return recommendations;
  }
}

// Database implementation

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings);
  }
  
  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting || undefined;
  }
  
  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [newMeeting] = await db
      .insert(meetings)
      .values(meeting)
      .returning();
    return newMeeting;
  }
  
  async createMeetingsFromCSV(meetingsData: MeetingCSV[]): Promise<Meeting[]> {
    const createdMeetings: Meeting[] = [];
    
    for (const data of meetingsData) {
      // Calculate a usefulness score based on the meeting data
      const usefulnessScore = this.calculateUsefulnessScore({
        durationMinutes: data.Duration_Minutes,
        participants: data.Participants,
        speakerRatio: data.Actual_Speakers / data.Participants,
        decisionMade: data.Decision_Made,
        agendaProvided: data.Agenda_Provided,
        followUpSent: data.Follow_Up_Sent,
        couldBeAsync: data.Could_Be_Async
      });
      
      // Generate a random date within the last month
      const now = new Date();
      const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.floor(Math.random() * 30));
      
      const meeting: InsertMeeting = {
        title: data.Meeting_Title,
        durationMinutes: data.Duration_Minutes,
        participants: data.Participants,
        actualSpeakers: data.Actual_Speakers,
        decisionMade: data.Decision_Made,
        agendaProvided: data.Agenda_Provided,
        followUpSent: data.Follow_Up_Sent,
        couldBeAsync: data.Could_Be_Async,
        usefulnessScore,
        date: pastDate
      };
      
      const createdMeeting = await this.createMeeting(meeting);
      createdMeetings.push(createdMeeting);
    }
    
    return createdMeetings;
  }
  
  async clearMeetings(): Promise<void> {
    await db.delete(meetings);
  }
  
  async getMeetingAnalytics(): Promise<MeetingAnalytics> {
    const meetings = await this.getMeetings();
    
    // Calculate summary metrics
    const summary = this.calculateSummary(meetings);
    
    // Calculate metric percentages
    const metrics = this.calculateMetrics(meetings);
    
    // Generate trend data by week
    const trends = this.calculateTrends(meetings);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(meetings);
    
    return {
      summary,
      metrics,
      trends,
      recommendations,
      meetings
    };
  }

  private calculateUsefulnessScore(params: {
    durationMinutes: number,
    participants: number,
    speakerRatio: number,
    decisionMade: boolean,
    agendaProvided: boolean,
    followUpSent: boolean,
    couldBeAsync: boolean
  }): number {
    // This is a simplified algorithm to calculate meeting usefulness
    let score = 50; // Base score
    
    // Decision made is a major factor
    if (params.decisionMade) score += 25;
    else score -= 15;
    
    // Speaker ratio (more speakers = more engagement)
    if (params.speakerRatio > 0.7) score += 15;
    else if (params.speakerRatio > 0.5) score += 10;
    else if (params.speakerRatio > 0.3) score += 5;
    else score -= 10;
    
    // Agenda and follow-up show organization
    if (params.agendaProvided) score += 10;
    if (params.followUpSent) score += 10;
    
    // If the meeting could be async, that's not great for the score
    if (params.couldBeAsync) score -= 15;
    
    // Duration factor - penalize very long meetings
    if (params.durationMinutes > 60) score -= 5;
    if (params.durationMinutes > 90) score -= 10;
    
    // Too many participants can be inefficient
    if (params.participants > 10) score -= 5;
    if (params.participants > 15) score -= 10;
    
    // Ensure score is within 0-100
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateSummary(meetings: Meeting[]): MeetingSummary {
    const totalMeetings = meetings.length;
    
    // Meetings with a score of 70 or higher are considered useful
    const usefulMeetings = meetings.filter(m => m.usefulnessScore >= 70).length;
    
    // Calculate percentage of useful meetings
    const usefulMeetingsPercentage = totalMeetings > 0 
      ? Math.round((usefulMeetings / totalMeetings) * 100) 
      : 0;
    
    // Meetings that could be replaced with async communication
    const asyncCandidates = meetings.filter(m => m.couldBeAsync).length;
    
    // Calculate time saved (assuming declined low-value meetings)
    const lowValueMeetings = meetings.filter(m => m.usefulnessScore < 50);
    const timeSavedMinutes = lowValueMeetings.reduce((sum, m) => sum + m.durationMinutes, 0);
    const timeSavedHours = Math.round(timeSavedMinutes / 6) / 10; // Round to 1 decimal
    
    // Calculate average meeting time per week (assuming 4 weeks of data)
    const totalHours = meetings.reduce((sum, m) => sum + m.durationMinutes, 0) / 60;
    const hoursPerWeek = Math.round(totalHours / 4 * 10) / 10; // Round to 1 decimal
    
    return {
      totalMeetings,
      usefulMeetings,
      usefulMeetingsPercentage,
      timeSavedHours,
      asyncCandidates,
      hoursPerWeek
    };
  }
  
  private calculateMetrics(meetings: Meeting[]): MeetingMetrics {
    if (meetings.length === 0) {
      return {
        decisionsPercentage: 0,
        actionsPercentage: 0,
        agendasPercentage: 0,
        followUpsPercentage: 0,
        asyncPercentage: 0
      };
    }
    
    const decisionsCount = meetings.filter(m => m.decisionMade).length;
    const actionsCount = meetings.filter(m => m.followUpSent).length;
    const agendasCount = meetings.filter(m => m.agendaProvided).length;
    const followUpsCount = meetings.filter(m => m.followUpSent).length;
    const asyncCount = meetings.filter(m => m.couldBeAsync).length;
    
    return {
      decisionsPercentage: Math.round((decisionsCount / meetings.length) * 100),
      actionsPercentage: Math.round((actionsCount / meetings.length) * 100),
      agendasPercentage: Math.round((agendasCount / meetings.length) * 100),
      followUpsPercentage: Math.round((followUpsCount / meetings.length) * 100),
      asyncPercentage: Math.round((asyncCount / meetings.length) * 100)
    };
  }
  
  private calculateTrends(meetings: Meeting[]): TrendData[] {
    if (meetings.length === 0) {
      return [];
    }
    
    // Group meetings by week
    const weeklyMeetings = new Map<number, Meeting[]>();
    
    for (const meeting of meetings) {
      const weekNum = this.getWeekNumber(new Date(meeting.date));
      if (!weeklyMeetings.has(weekNum)) {
        weeklyMeetings.set(weekNum, []);
      }
      weeklyMeetings.get(weekNum)!.push(meeting);
    }
    
    // Calculate usefulness percentage by week
    const trends: TrendData[] = [];
    
    for (const [weekNum, weekMeetings] of weeklyMeetings.entries()) {
      const usefulMeetings = weekMeetings.filter(m => m.usefulnessScore >= 70).length;
      const percentage = Math.round((usefulMeetings / weekMeetings.length) * 100);
      
      trends.push({
        week: `Week ${weekNum}`,
        usefulnessPercentage: percentage
      });
    }
    
    // Sort by week number
    return trends.sort((a, b) => {
      const weekA = parseInt(a.week.replace('Week ', ''));
      const weekB = parseInt(b.week.replace('Week ', ''));
      return weekA - weekB;
    });
  }
  
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
  }
  
  private generateRecommendations(meetings: Meeting[]): MeetingRecommendation[] {
    if (meetings.length === 0) {
      return [];
    }
    
    const recommendations: MeetingRecommendation[] = [];
    
    // Find meetings that could be async
    const asyncCandidates = meetings.filter(m => 
      m.couldBeAsync && 
      m.usefulnessScore < 60 && 
      m.participants > 5
    ).slice(0, 2);
    
    // Find meetings to decline (low value, too many participants)
    const declineCandidates = meetings.filter(m => 
      m.usefulnessScore < 40 && 
      m.participants > 8 && 
      !m.decisionMade
    ).slice(0, 2);
    
    // Find meetings to optimize (medium value but too long)
    const optimizeCandidates = meetings.filter(m => 
      m.usefulnessScore >= 40 && 
      m.usefulnessScore < 70 && 
      m.durationMinutes > 45
    ).slice(0, 2);
    
    let id = 1;
    
    // Add async recommendations
    for (const meeting of asyncCandidates) {
      recommendations.push({
        id: id++,
        title: meeting.title,
        durationMinutes: meeting.durationMinutes,
        participants: meeting.participants,
        recommendationType: 'async',
        reason: `Low engagement (${meeting.actualSpeakers} of ${meeting.participants} participants spoke) and no decisions made.`,
        suggestion: `Use a collaborative document, project task, or chat thread instead.`
      });
    }
    
    // Add decline recommendations
    for (const meeting of declineCandidates) {
      recommendations.push({
        id: id++,
        title: meeting.title,
        durationMinutes: meeting.durationMinutes,
        participants: meeting.participants,
        recommendationType: 'decline',
        reason: `Low value score (${meeting.usefulnessScore}%), too many participants (${meeting.participants}) and no decisions made.`,
        suggestion: `Request an agenda or clear purpose before accepting`
      });
    }
    
    // Add optimization recommendations
    for (const meeting of optimizeCandidates) {
      recommendations.push({
        id: id++,
        title: meeting.title,
        durationMinutes: meeting.durationMinutes,
        participants: meeting.participants,
        recommendationType: 'optimize',
        reason: `Meeting length (${meeting.durationMinutes} mins) could be reduced while maintaining its value.`,
        suggestion: `Suggest a focused ${Math.max(15, Math.floor(meeting.durationMinutes / 2))}-minute agenda`
      });
    }
    
    return recommendations;
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();

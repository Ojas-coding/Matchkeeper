
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin'; // Only system admin role remains
}

export interface EventParticipant {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  role: 'player' | 'coach' | 'admin';
  joinedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  joinCode: string;
  pendingRequests?: JoinRequest[];
  participants?: EventParticipant[];
  sport: SportType;
  announcements?: Announcement[];
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  requestedRole: 'player' | 'coach' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  eventId: string;
  eventTitle: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type SportType = 'basketball' | 'american-football' | 'football' | 'tennis' | 'volleyball' | 'cricket' | 'boxing' | 'swimming' | 'golf';

export interface Match {
  id: string;
  title: string;
  teamA: string;
  teamB: string;
  scoreA?: number | string;
  scoreB?: number | string;
  detailedScore?: any;
  startTime: string;
  endTime?: string;
  status: MatchStatus;
  eventId: string;
  notes?: string;
  sport: SportType;
}

export type MatchStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

// Sport-specific scoring interfaces
export interface BasketballScore {
  quarters: number[];
  totalPoints: number;
  fouls: number;
  timeouts: number;
}

export interface AmericanFootballScore {
  touchdowns: number;
  fieldGoals: number;
  safeties: number;
  totalPoints: number;
  yards: number;
}

export interface FootballScore {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  possession: number;
}

export interface TennisScore {
  sets: string[];
  games: number[];
  currentSet?: string;
}

export interface VolleyballScore {
  sets: number[];
  totalSets: number;
  points: number;
}

export interface CricketScore {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
}

export interface BoxingScore {
  rounds: number[];
  knockdowns: number;
  totalPoints: number;
  result?: 'KO' | 'TKO' | 'Decision' | 'Draw';
}

export interface SwimmingScore {
  time: string;
  strokes: number;
  lane: number;
}

export interface GolfScore {
  holes: number[];
  totalStrokes: number;
  par: number;
  handicap?: number;
}

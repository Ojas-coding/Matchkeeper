import { Event, Match, MatchStatus, User, JoinRequest, Announcement } from "@/types";
import { mockEvents, mockMatches, mockUsers } from "./mockData";

let loggedInUser: User | null = null;
let mockAnnouncements: Announcement[] = [];

// Helper function to generate a strong random join code
const generateJoinCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Authentication Services
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  // In a real app, we'd validate the password
  // For this mock, we're just checking if the email exists
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        loggedInUser = user;
      }
      resolve(user || null);
    }, 500);
  });
};

export const logoutUser = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      loggedInUser = null;
      resolve();
    }, 300);
  });
};

export const registerUser = async (
  name: string, 
  email: string, 
  password: string
): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        resolve(null);
        return;
      }

      // Create new user - all users are system admins
      const newUser: User = {
        id: `user${mockUsers.length + 1}`,
        name,
        email,
        role: 'admin'
      };

      mockUsers.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

export const resetPassword = async (email: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if the email exists
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // In a real app, we'd send an email with reset instructions
      // For this mock, we'll just pretend it worked if the user exists
      resolve(!!existingUser);
    }, 800);
  });
};

// User Management
export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loggedInUser);
    }, 300);
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockUsers]);
    }, 500);
  });
};

// Events Management
export const getEvents = async (): Promise<Event[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockEvents]);
    }, 500);
  });
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.id === eventId) || null;
      resolve(event);
    }, 300);
  });
};

export const getEventByJoinCode = async (joinCode: string): Promise<Event | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.joinCode?.toLowerCase() === joinCode.toLowerCase()) || null;
      resolve(event);
    }, 300);
  });
};

export const requestToJoinEvent = async (joinCode: string, requestedRole: 'player' | 'coach' | 'admin'): Promise<{ success: boolean; message: string; eventTitle?: string }> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    if (!user) {
      resolve({ success: false, message: "You must be logged in to join an event." });
      return;
    }

    setTimeout(() => {
      const event = mockEvents.find(e => e.joinCode?.toLowerCase() === joinCode.toLowerCase());
      if (!event) {
        resolve({ success: false, message: "Invalid join code. Please check and try again." });
        return;
      }

      // Initialize pendingRequests if it doesn't exist
      if (!event.pendingRequests) {
        event.pendingRequests = [];
      }

      // Check if user already has a pending or approved request
      const existingRequest = event.pendingRequests.find(r => r.userId === user.id);
      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          resolve({ success: false, message: "You already have a pending request for this event." });
        } else if (existingRequest.status === 'approved') {
          resolve({ success: false, message: "You are already part of this event." });
        } else {
          resolve({ success: false, message: "Your previous request was rejected." });
        }
        return;
      }

      // Create new join request
      const newRequest: JoinRequest = {
        id: `req${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        eventId: event.id,
        requestedRole,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      event.pendingRequests.push(newRequest);
      resolve({ 
        success: true, 
        message: `Join request sent for "${event.title}" as ${requestedRole}. Please wait for approval from the event organizer.`,
        eventTitle: event.title
      });
    }, 500);
  });
};

export const createEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'createdBy' | 'joinCode'>): Promise<Event> => {
  return new Promise(async (resolve) => {
    // Get the current user first
    const user = await getCurrentUser();
    
    // Generate a unique join code
    let joinCode = generateJoinCode();
    while (mockEvents.some(e => e.joinCode === joinCode)) {
      joinCode = generateJoinCode();
    }
    
    const newEvent: Event = {
      ...event,
      id: `evt${mockEvents.length + 1}`,
      createdBy: user?.id || 'unknown',
      createdAt: new Date().toISOString(),
      joinCode,
      pendingRequests: [],
      announcements: [],
      sport: event.sport || 'basketball', // Default to basketball if not specified
    };
    
    setTimeout(() => {
      mockEvents.push(newEvent);
      resolve(newEvent);
    }, 500);
  });
};

// Announcements Management
export const getAnnouncements = async (): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockAnnouncements]);
    }, 300);
  });
};

export const getAnnouncementsByEventId = async (eventId: string): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const announcements = mockAnnouncements.filter(a => a.eventId === eventId);
      resolve(announcements);
    }, 300);
  });
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'createdBy' | 'createdByName'>): Promise<Announcement> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    const event = mockEvents.find(e => e.id === announcement.eventId);
    
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `ann${mockAnnouncements.length + 1}`,
      createdBy: user?.id || 'unknown',
      createdByName: user?.name || 'Unknown',
      eventTitle: event?.title || 'Unknown Event',
      createdAt: new Date().toISOString(),
    };
    
    setTimeout(() => {
      mockAnnouncements.push(newAnnouncement);
      // Also add to event's announcements array
      if (event) {
        if (!event.announcements) {
          event.announcements = [];
        }
        event.announcements.push(newAnnouncement);
      }
      resolve(newAnnouncement);
    }, 500);
  });
};

// Matches Management
export const getMatches = async (): Promise<Match[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockMatches]);
    }, 500);
  });
};

export const getMatchesByEventId = async (eventId: string): Promise<Match[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matches = mockMatches.filter(m => m.eventId === eventId);
      resolve(matches);
    }, 300);
  });
};

export const getMatchById = async (matchId: string): Promise<Match | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const match = mockMatches.find(m => m.id === matchId) || null;
      resolve(match);
    }, 300);
  });
};

export const createMatch = async (match: Omit<Match, 'id'>): Promise<Match> => {
  const newMatch: Match = {
    ...match,
    id: `match${mockMatches.length + 1}`,
    sport: match.sport || 'basketball', // Default to basketball if not specified
  };
  
  return new Promise((resolve) => {
    setTimeout(() => {
      mockMatches.push(newMatch);
      resolve(newMatch);
    }, 500);
  });
};

export const updateMatchStatus = async (matchId: string, status: MatchStatus, scoreA?: number, scoreB?: number): Promise<Match | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matchIndex = mockMatches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) {
        resolve(null);
        return;
      }

      const updatedMatch = {
        ...mockMatches[matchIndex],
        status,
        ...(scoreA !== undefined && { scoreA }),
        ...(scoreB !== undefined && { scoreB }),
        ...(status === 'completed' && { endTime: new Date().toISOString() })
      };
      
      mockMatches[matchIndex] = updatedMatch;
      resolve(updatedMatch);
    }, 500);
  });
};

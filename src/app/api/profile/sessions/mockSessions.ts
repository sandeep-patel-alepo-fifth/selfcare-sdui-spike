import { Session } from "@/types/profile";

// Mock sessions data - shared across session routes
export const mockSessions: Session[] = [
  {
    id: "session-1",
    device: "MacBook Pro",
    browser: "Chrome 120",
    location: "New York, US",
    ipAddress: "192.168.1.1",
    lastActive: new Date().toISOString(),
    current: true,
  },
  {
    id: "session-2",
    device: "iPhone 15",
    browser: "Safari Mobile",
    location: "Los Angeles, US",
    ipAddress: "10.0.0.5",
    lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    current: false,
  },
  {
    id: "session-3",
    device: "Windows PC",
    browser: "Firefox 121",
    location: "Chicago, US",
    ipAddress: "172.16.0.10",
    lastActive: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    current: false,
  },
];

// Set of valid session IDs for quick lookup
export const mockSessionIds = new Set(mockSessions.map((s) => s.id));

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Devices,
  Computer,
  PhoneIphone,
  Tablet,
  Logout,
} from "@mui/icons-material";
import { Session } from "@/types/profile";

interface SessionListProps {
  sessions: Session[];
  onLogout: (sessionId: string) => Promise<void> | void;
  onLogoutAll?: () => Promise<void> | void;
  loading?: boolean;
}

function formatLastActive(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDeviceIcon(device: string) {
  const deviceLower = device.toLowerCase();
  if (deviceLower.includes("iphone") || deviceLower.includes("android")) {
    return <PhoneIphone />;
  }
  if (deviceLower.includes("ipad") || deviceLower.includes("tablet")) {
    return <Tablet />;
  }
  return <Computer />;
}

export function SessionList({
  sessions,
  onLogout,
  onLogoutAll,
  loading = false,
}: SessionListProps) {
  const currentSession = sessions.find((s) => s.current);
  const otherSessions = sessions.filter((s) => !s.current);
  const hasOtherSessions = otherSessions.length > 0;

  const handleLogoutAll = async () => {
    // If a dedicated onLogoutAll callback is provided, use it (preferred for atomic operations)
    if (onLogoutAll) {
      await onLogoutAll();
      return;
    }

    // Otherwise, logout all sessions in parallel using Promise.allSettled
    // to handle partial failures gracefully
    const results = await Promise.allSettled(
      otherSessions.map((session) => onLogout(session.id))
    );

    // Check for any failures
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      // In production, you would want to show which sessions failed to logout
      // and potentially allow the user to retry those specific sessions
      console.error(`Failed to logout ${failures.length} session(s)`);
    }
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200" }}
        data-testid="session-list-skeleton"
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={150} />
          </Box>
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={72}
              sx={{ mb: 2, borderRadius: 1 }}
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Devices color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Active Sessions</Typography>
          </Box>
          {hasOtherSessions && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Logout />}
              onClick={handleLogoutAll}
            >
              Logout All Other Sessions
            </Button>
          )}
        </Box>

        <List disablePadding>
          {/* Current Session */}
          {currentSession && (
            <>
              <ListItem
                sx={{
                  bgcolor: "primary.50",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>{getDeviceIcon(currentSession.device)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle2">
                        {currentSession.device}
                      </Typography>
                      <Chip
                        label="Current Session"
                        size="small"
                        color="primary"
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      <Typography variant="body2" component="span">
                        {currentSession.browser}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mx: 1 }}
                      >
                        |
                      </Typography>
                      <Typography variant="body2" component="span">
                        {currentSession.location}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mx: 1 }}
                      >
                        |
                      </Typography>
                      <Typography variant="body2" component="span">
                        {currentSession.ipAddress}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mx: 1 }}
                      >
                        |
                      </Typography>
                      <Typography variant="body2" component="span">
                        {formatLastActive(currentSession.lastActive)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {hasOtherSessions && <Divider sx={{ my: 2 }} />}
            </>
          )}

          {/* Other Sessions */}
          {hasOtherSessions ? (
            otherSessions.map((session, index) => (
              <ListItem
                key={session.id}
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  mb: index < otherSessions.length - 1 ? 1 : 0,
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="logout"
                    onClick={() => onLogout(session.id)}
                    color="error"
                  >
                    <Logout />
                  </IconButton>
                }
              >
                <ListItemIcon>{getDeviceIcon(session.device)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">{session.device}</Typography>
                  }
                  secondary={
                    <Box component="span">
                      <Typography variant="body2" component="span">
                        {session.browser}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mx: 1 }}
                      >
                        |
                      </Typography>
                      <Typography variant="body2" component="span">
                        {session.location}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mx: 1 }}
                      >
                        |
                      </Typography>
                      <Typography variant="body2" component="span">
                        {session.ipAddress}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mx: 1 }}
                      >
                        |
                      </Typography>
                      <Typography variant="body2" component="span">
                        {formatLastActive(session.lastActive)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                This is your only active session.
              </Typography>
            </Box>
          )}
        </List>
      </CardContent>
    </Card>
  );
}

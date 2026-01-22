"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  Person,
  ChildCare,
  Shield,
} from "@mui/icons-material";
import { FamilyMember, FamilyMemberStatus, FamilyRole } from "@/types/family";

interface FamilyMemberCardProps {
  member: FamilyMember;
  onViewDetails?: (member: FamilyMember) => void;
  onManageControls?: (member: FamilyMember) => void;
}

function getStatusColor(status: FamilyMemberStatus): "success" | "warning" | "error" {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "suspended":
      return "error";
    default:
      return "warning";
  }
}

function getStatusLabel(status: FamilyMemberStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "Pending";
    case "suspended":
      return "Suspended";
    default:
      return status;
  }
}

function getRoleLabel(role: FamilyRole): string {
  return role === "parent" ? "Parent" : "Child";
}

function getRoleColor(role: FamilyRole): "primary" | "secondary" {
  return role === "parent" ? "primary" : "secondary";
}

export function FamilyMemberCard({
  member,
  onViewDetails,
  onManageControls,
}: FamilyMemberCardProps) {
  const hasControls = member.role === "child" && member.controls;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(member);
    }
  };

  const handleManageControls = () => {
    if (onManageControls) {
      onManageControls(member);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200" }}
      role="article"
      data-testid="family-member-card"
    >
      <CardContent>
        {/* Header with avatar, name, and badges */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Avatar
            src={member.avatarUrl || undefined}
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              bgcolor: member.role === "parent" ? "primary.main" : "secondary.main",
            }}
          >
            {member.role === "parent" ? <Person /> : <ChildCare />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {member.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.phone}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              label={getRoleLabel(member.role)}
              color={getRoleColor(member.role)}
              size="small"
              variant="outlined"
            />
            <Chip
              label={getStatusLabel(member.status)}
              color={getStatusColor(member.status)}
              size="small"
            />
          </Stack>
        </Box>

        {/* Plan info */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {member.planName}
        </Typography>

        {/* Data usage */}
        {member.usage?.data && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                Data Usage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {member.usage.data.percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={member.usage.data.percentage}
              sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
              color={member.usage.data.percentage > 80 ? "error" : "primary"}
            />
            <Typography variant="caption" color="text.secondary">
              {member.usage.data.used} GB of {member.usage.data.total} GB
            </Typography>
          </Box>
        )}

        {/* Parental controls indicator */}
        {hasControls && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "info.light",
              color: "info.dark",
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Shield fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="caption" fontWeight={500}>
              Controls Active
            </Typography>
          </Box>
        )}

        {/* Action buttons */}
        <Stack direction="row" spacing={1}>
          {onViewDetails && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          )}
          {member.role === "child" && onManageControls && (
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={handleManageControls}
            >
              Manage Controls
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

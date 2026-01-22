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
  Divider,
  Alert,
} from "@mui/material";
import {
  ChildCare,
  FilterList,
  Block,
  DataUsage,
  Phone,
  Sms,
  Warning,
} from "@mui/icons-material";
import { FamilyMember, FamilyMemberStatus } from "@/types/family";

interface ChildAccountCardProps {
  child: FamilyMember;
  onEditControls?: (child: FamilyMember) => void;
  onRemove?: (child: FamilyMember) => void;
  onViewUsage?: (child: FamilyMember) => void;
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

export function ChildAccountCard({
  child,
  onEditControls,
  onRemove,
  onViewUsage,
}: ChildAccountCardProps) {
  const hasHighDataUsage = (child.usage?.data?.percentage ?? 0) > 80;
  const hasHighVoiceUsage = (child.usage?.voice?.percentage ?? 0) > 80;
  const hasHighUsage = hasHighDataUsage || hasHighVoiceUsage;

  const handleEditControls = () => {
    if (onEditControls) {
      onEditControls(child);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(child);
    }
  };

  const handleViewUsage = () => {
    if (onViewUsage) {
      onViewUsage(child);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200" }}
      role="article"
      data-testid="child-account-card"
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Avatar
            src={child.avatarUrl || undefined}
            sx={{
              width: 56,
              height: 56,
              mr: 2,
              bgcolor: "secondary.main",
            }}
          >
            <ChildCare />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {child.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {child.phone}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(child.status)}
            color={getStatusColor(child.status)}
            size="small"
          />
        </Box>

        {/* High usage warning */}
        {hasHighUsage && (
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              High usage alert - approaching limit
            </Typography>
          </Alert>
        )}

        {/* Usage section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Usage
          </Typography>

          {/* Data usage */}
          {child.usage?.data && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <DataUsage fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" fontWeight={500}>
                  Data
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                  {child.usage.data.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={child.usage.data.percentage}
                sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                color={hasHighDataUsage ? "error" : "primary"}
              />
              <Typography variant="caption" color="text.secondary">
                {child.usage.data.used} GB of {child.usage.data.total} GB
              </Typography>
            </Box>
          )}

          {/* Voice usage */}
          {child.usage?.voice && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <Phone fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" fontWeight={500}>
                  Voice
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                  {child.usage.voice.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={child.usage.voice.percentage}
                sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                color={hasHighVoiceUsage ? "error" : "primary"}
              />
              <Typography variant="caption" color="text.secondary">
                {child.usage.voice.used} min of {child.usage.voice.total} min
              </Typography>
            </Box>
          )}

          {/* SMS usage */}
          {child.usage?.sms && (
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <Sms fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" fontWeight={500}>
                  SMS
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                  {child.usage.sms.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={child.usage.sms.percentage}
                sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                color={child.usage.sms.percentage > 80 ? "error" : "primary"}
              />
              <Typography variant="caption" color="text.secondary">
                {child.usage.sms.used} of {child.usage.sms.total}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Parental controls section */}
        {child.controls && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Parental Controls
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {child.controls.dataLimit && (
                <Chip
                  icon={<DataUsage fontSize="small" />}
                  label={`${child.controls.dataLimit} GB limit`}
                  size="small"
                  variant="outlined"
                />
              )}
              {child.controls.contentFiltering && (
                <Chip
                  icon={<FilterList fontSize="small" />}
                  label="Content Filtering"
                  size="small"
                  variant="outlined"
                  color="info"
                />
              )}
              {child.controls.purchaseBlocked && (
                <Chip
                  icon={<Block fontSize="small" />}
                  label="Purchases Blocked"
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              )}
              {child.controls.internationalBlocked && (
                <Chip
                  label="International Blocked"
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              )}
              {child.controls.premiumServicesBlocked && (
                <Chip
                  label="Premium Services Blocked"
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Action buttons */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {onViewUsage && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleViewUsage}
            >
              View Usage
            </Button>
          )}
          {onEditControls && (
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={handleEditControls}
            >
              Edit Controls
            </Button>
          )}
          {onRemove && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

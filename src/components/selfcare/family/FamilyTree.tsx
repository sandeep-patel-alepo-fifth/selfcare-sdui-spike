"use client";

import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Button,
  Avatar,
  Stack,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Person,
  ChildCare,
  Add,
  Settings,
  AccountTree,
} from "@mui/icons-material";
import { FamilyHierarchy, FamilyMember, FamilyMemberStatus } from "@/types/family";

interface FamilyTreeProps {
  hierarchy: FamilyHierarchy | null;
  loading?: boolean;
  onSelectMember?: (member: FamilyMember) => void;
  onAddChild?: () => void;
  onManageChild?: (child: FamilyMember) => void;
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

interface MemberNodeProps {
  member: FamilyMember;
  isParent?: boolean;
  onClick?: () => void;
  onManage?: () => void;
}

function MemberNode({ member, isParent = false, onClick, onManage }: MemberNodeProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "2px solid",
        borderColor: isParent ? "primary.main" : "grey.200",
        minWidth: 200,
      }}
    >
      <CardActionArea onClick={onClick} disabled={!onClick}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar
              src={member.avatarUrl || undefined}
              sx={{
                width: 40,
                height: 40,
                mr: 1.5,
                bgcolor: isParent ? "primary.main" : "secondary.main",
              }}
            >
              {isParent ? <Person fontSize="small" /> : <ChildCare fontSize="small" />}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {member.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {member.phone}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {isParent && (
              <Chip label="Parent" size="small" color="primary" variant="outlined" />
            )}
            <Chip
              label={getStatusLabel(member.status)}
              size="small"
              color={getStatusColor(member.status)}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
      {!isParent && onManage && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<Settings fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              onManage();
            }}
          >
            Manage
          </Button>
        </Box>
      )}
    </Card>
  );
}

function FamilyTreeSkeleton() {
  return (
    <Box data-testid="family-tree-skeleton">
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Skeleton variant="rounded" width={240} height={100} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Skeleton variant="rectangular" width={2} height={40} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
        <Skeleton variant="rounded" width={200} height={120} />
        <Skeleton variant="rounded" width={200} height={120} />
      </Box>
    </Box>
  );
}

export function FamilyTree({
  hierarchy,
  loading = false,
  onSelectMember,
  onAddChild,
  onManageChild,
}: FamilyTreeProps) {
  if (loading || !hierarchy) {
    return <FamilyTreeSkeleton />;
  }

  const { parent, children, maxChildren } = hierarchy;
  const childCount = children.length;
  const isAtMaxChildren = childCount >= maxChildren;

  return (
    <Box>
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
          <AccountTree sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight={600}>
            Family Plan
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {childCount} child account{childCount !== 1 ? "s" : ""} of {maxChildren}
        </Typography>
      </Box>

      {/* Parent Section */}
      <Box
        data-testid="parent-section"
        sx={{ display: "flex", justifyContent: "center", mb: 2 }}
      >
        <MemberNode
          member={parent}
          isParent
          onClick={onSelectMember ? () => onSelectMember(parent) : undefined}
        />
      </Box>

      {/* Connector Line */}
      <Box
        data-testid="hierarchy-connector"
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: 2,
            height: 40,
            bgcolor: "grey.300",
          }}
        />
        {children.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${Math.min(children.length * 220, 680)}px`,
              height: 2,
              bgcolor: "grey.300",
            }}
          />
        )}
      </Box>

      {/* Children Section */}
      <Box data-testid="children-section" sx={{ mt: 2 }}>
        {children.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No child accounts yet
            </Typography>
            {onAddChild && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAddChild}
              >
                Add Child Account
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 3,
              }}
            >
              {children.map((child) => (
                <Box key={child.id} sx={{ position: "relative" }}>
                  {children.length > 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 2,
                        height: 18,
                        bgcolor: "grey.300",
                      }}
                    />
                  )}
                  <MemberNode
                    member={child}
                    onClick={onSelectMember ? () => onSelectMember(child) : undefined}
                    onManage={onManageChild ? () => onManageChild(child) : undefined}
                  />
                </Box>
              ))}
            </Box>

            {/* Add child button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              {isAtMaxChildren ? (
                <Alert severity="info" sx={{ maxWidth: 400 }}>
                  <Typography variant="body2">
                    Maximum child accounts reached ({maxChildren})
                  </Typography>
                </Alert>
              ) : (
                onAddChild && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={onAddChild}
                    disabled={isAtMaxChildren}
                  >
                    Add Child Account
                  </Button>
                )
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

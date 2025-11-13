"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface AssignmentNotificationBadgeProps {
  assignmentId: string;
  notifiedAssignmentIds: Set<string>;
}

export function AssignmentNotificationBadge({
  assignmentId,
  notifiedAssignmentIds,
}: AssignmentNotificationBadgeProps) {
  const hasNotification = notifiedAssignmentIds.has(assignmentId);

  if (!hasNotification) return null;

  return (
    <Badge variant="destructive" className="ml-2 animate-pulse">
      <Bell className="h-3 w-3 mr-1" />
      ครูแจ้งเตือน
    </Badge>
  );
}

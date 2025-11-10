"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Download, UserPlus, BookOpen } from "lucide-react";

interface ClassBatchActionsProps {
  classroomId: string;
}

export function ClassBatchActions({ classroomId }: ClassBatchActionsProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Actions -Coming Soon!-</CardTitle>
        <CardDescription>Perform actions on selected students</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={selectedStudents.length === 0}>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" size="sm" disabled={selectedStudents.length === 0}>
            <BookOpen className="h-4 w-4 mr-2" />
            Assign Reading
          </Button>
          <Button variant="outline" size="sm" disabled={selectedStudents.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {selectedStudents.length} student(s) selected
        </div>
      </CardContent>
    </Card>
  );
}

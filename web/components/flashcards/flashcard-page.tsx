"use client";

import React from "react";
import FlashcardDashboard from "@/components/flashcards/flashcard-dashboard";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function FlashcardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access flashcards.</p>
      </div>
    );
  }

  const getUserId = () => {
    if (!session) return null;
    
    if (session.user?.id) {
      return session.user.id;
    }
    
    if (typeof session === 'object' && 'value' in session && typeof session.value === 'string') {
      try {
        const parsed = JSON.parse(session.value);
        return parsed.id;
      } catch {
        return null;
      }
    }
    
    return null;
  };

  const userId = getUserId();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <FlashcardDashboard userId={userId} />;
}

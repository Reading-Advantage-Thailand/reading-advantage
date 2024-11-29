"use client";
import React from "react";
import { useOnborda } from "onborda";
import { Button } from "../ui/button";
import { BookOpen, Sparkles } from "lucide-react";

function StartTour() {
  const { startOnborda } = useOnborda();
  const handleStartOnborda = () => {
    startOnborda("fristtour");
  };
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <Button size="lg" onClick={handleStartOnborda}>
        <Sparkles size={16} className="mr-2" /> Start the tour
      </Button>
    </div>
  );
}

export default StartTour;

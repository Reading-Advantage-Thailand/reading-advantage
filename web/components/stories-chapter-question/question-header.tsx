"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

type Props = {
  children: React.ReactNode;
  heading: string;
  description: string;
  buttonLabel: string;
  className?: string;
  disabled?: boolean;
  userId: string;
  storyId: string;
};

type ActivityType = {
  [key: string]: string;
};

export default function QuestionHeader({
  children,
  heading,
  description,
  buttonLabel,
  userId,
  storyId,
  disabled = true,
}: Props) {
  const [isButtonClicked, setIsButtonClicked] = React.useState<boolean>(false);
  async function onButtonClick() {
    setIsButtonClicked(true);
    const activityTypes: ActivityType = {
      "Practice Writing": "la_question",
      "Start Quiz": "mc_question",
      "Start Writing": "sa_question",
    };

    const activityType = activityTypes[buttonLabel as keyof ActivityType];

  }
  return isButtonClicked ? (
    <>{children}</>
  ) : (
    <div className="w-full">
      <CardHeader>
        <CardTitle className="font-bold text-3xl md:text-3xl">
          {heading}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onButtonClick} disabled={disabled}>
          {buttonLabel}
        </Button>
      </CardContent>
    </div>
  );
}

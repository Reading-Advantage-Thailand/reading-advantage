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
  articleId: string;
  userLevel: number;
  userXP: number;
};

export default function QuestionHeader({
  children,
  heading,
  description,
  buttonLabel,
  userId,
  articleId,
  userLevel,
  userXP,
  disabled = true,
}: Props) {
  const [isButtonClicked, setIsButtonClicked] = React.useState<boolean>(false);
  async function onButtonClick() {
    setIsButtonClicked(true);
    if (buttonLabel === "Practice Writing") {
      fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        body: JSON.stringify({
          activityType: "la_question",
          articleId,
          initialXp: userXP,
          finalXp: userXP,
          initialLevel: userLevel,
          finalLevel: userLevel,
        }),
      });
    } else if (buttonLabel === "Start Quiz") {
      fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        body: JSON.stringify({
          activityType: "mc_question",
          articleId,
          initialXp: userXP,
          finalXp: userXP,
          initialLevel: userLevel,
          finalLevel: userLevel,
        }),
      });
    } else if (buttonLabel === "Start Writing") {
      fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "POST",
        body: JSON.stringify({
          activityType: "sa_question",
          articleId,
          initialXp: userXP,
          finalXp: userXP,
          initialLevel: userLevel,
          finalLevel: userLevel,
        }),
      });
    }
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

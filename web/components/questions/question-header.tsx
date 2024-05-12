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
};

export default function QuestionHeader({
  children,
  heading,
  description,
  buttonLabel,
  disabled = true,
}: Props) {
  const [isButtonClicked, setIsButtonClicked] = React.useState<boolean>(false);
  function onButtonClick() {
    setIsButtonClicked(true);
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

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArticleType } from "@/types";
import Tokenizer from "sentence-tokenizer";
import { toast } from "../components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useScopedI18n } from "@/locales/client";
// import { showToast } from '../components/ui/use-toast'; // Add the missing import statement
import { useState } from "react";
import axios from "axios";
import { get } from "lodash";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// const date = new Date(createdAt._seconds * 1000).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
//Date formatting
export function formatDate(updatedAt: {
  _seconds: number;
  _nanoseconds: number;
}): string {
  const currentDate = new Date();
  const updatedDate = new Date(updatedAt._seconds * 1000);

  const timeDifferenceInSeconds = Math.floor(
    (currentDate.getTime() - updatedDate.getTime()) / 1000
  );

  if (timeDifferenceInSeconds < 60) {
    return `${timeDifferenceInSeconds} seconds ago`;
  } else if (timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (timeDifferenceInSeconds < 86400) {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(timeDifferenceInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
}

export function camelToSentenceCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

export const splitToText = (article: ArticleType) => {
  const tokenizer = new Tokenizer("Chuck");
  tokenizer.setEntry(article.content);
  const result = tokenizer.getSentences();
  const textArray = [];

  for (let i = 0; i < article.timepoints.length; i++) {
    textArray.push({
      text: result[i],
      begin: article.timepoints[i].timeSeconds,
    });
  }

  return textArray;
};

export function levelCalculation(score: number) {
  const levels = [
    { min: 0, max: 3000, cefrLevel: "A0-", raLevel: 0 },
    { min: 3001, max: 5000, cefrLevel: "A0", raLevel: 1 },
    { min: 5001, max: 11000, cefrLevel: "A0+", raLevel: 2 },
    { min: 11001, max: 18000, cefrLevel: "A1", raLevel: 3 },
    { min: 18001, max: 26000, cefrLevel: "A1+", raLevel: 4 },
    { min: 26001, max: 35000, cefrLevel: "A2-", raLevel: 5 },
    { min: 35001, max: 45000, cefrLevel: "A2", raLevel: 6 },
    { min: 45001, max: 56000, cefrLevel: "A2+", raLevel: 7 },
    { min: 56001, max: 68000, cefrLevel: "B1-", raLevel: 8 },
    { min: 68001, max: 81000, cefrLevel: "B1", raLevel: 9 },
    { min: 81001, max: 95000, cefrLevel: "B1+", raLevel: 10 },
    { min: 95001, max: 110000, cefrLevel: "B2-", raLevel: 11 },
    { min: 110001, max: 126000, cefrLevel: "B2", raLevel: 12 },
    { min: 126001, max: 143000, cefrLevel: "B2+", raLevel: 13 },
    { min: 143001, max: 161000, cefrLevel: "C1-", raLevel: 14 },
    { min: 161001, max: 180000, cefrLevel: "C1", raLevel: 15 },
    { min: 180001, max: 221000, cefrLevel: "C1+", raLevel: 16 },
    { min: 221001, max: 243000, cefrLevel: "C2-", raLevel: 17 },
    { min: 243000, max: 243000, cefrLevel: "C2", raLevel: 18 },
  ];

  for (let level of levels) {
    if (score >= level.min && score <= level.max) {
      return { cefrLevel: level.cefrLevel, raLevel: level.raLevel };
    }
  }

  return { cefrLevel: "", raLevel: "" };
}

export async function updateScore(
  xp: number,
  userId: string,
  updateSession?: Function
) {
  try {
    const previousData = await getPreviousData(userId);
    const cefrLevell = previousData?.cefrLevel;
    let previousXp = previousData?.previousXp;

    console.log("cefrLevell: ", cefrLevell);

    // const previousXp = await getCefrLevel(userId);

    let newScore = 0;
    // let previousXp = 0;

    if (cefrLevell === "") {
      //increase new xp with 0
      previousXp = 0;
      newScore = previousXp + xp;
      console.log("newScore", newScore);
      console.log("previousXp", previousXp);
    } else {
      // increase new xp with actual new xp
      //  previousXp = previousXp
      newScore = previousXp + xp;
      console.log("newScore2", newScore);
      console.log("previousXp2", previousXp);
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        xp: newScore,
        level: levelCalculation(newScore).raLevel,
        cefrLevel: levelCalculation(newScore).cefrLevel,
      }),
    });

    const data = await response.json();
    (await updateSession)
      ? {
          user: {
            // ...session?.user,
            xp: previousXp + newScore,
            level: levelCalculation(xp).raLevel,
            cefrLevel: levelCalculation(xp).cefrLevel,
          },
        }
      : null;

    return "success";
  } catch (error) {
    console.log("Error:", error);
    return "error";
  }
}

//write a function to get cefrLevel from firebase
export async function getPreviousData(userId: string) {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    const data = response.data;
    const cefrLevel = data.data.cefrLevel;
    const previousXp = data.data.xp;
    console.log("data", data);
    // return data.data.cefrLevel;
    return { cefrLevel, previousXp };
  } catch (error) {
    console.log("Error:", error);
  }
}

// updateScore(9000, "qWXtOI9Hr6QtILuhsrOc06zXZUg1");

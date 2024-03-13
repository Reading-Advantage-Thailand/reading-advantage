import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArticleType } from "@/types";
import Tokenizer from "sentence-tokenizer";
import axios from "axios";

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

/**
 * Splits the given content into sentences.
 *
 * If the content contains newline characters (\n or \\n), it replaces them with an empty string
 * and then splits the content into sentences. Otherwise, it uses a sentence tokenizer to split
 * the content into sentences.
 *
 * @param {string} content - The content to split into sentences.
 * @returns {string[]} An array of sentences.
 */
export function splitTextIntoSentences(content: string): string[] {
  // If content contains \n 
  const regex = /(\n\n|\n|\\n\\n|\\n)/g;
  if (content.match(regex)) {
    const replaced = content.replace(regex, '')
    const sentences = replaced.split(/(?<!\b(?:Mr|Mrs|Dr|Ms|St|Ave|Rd|Blvd|Ph|D|Jr|Sr|Co|Inc|Ltd|Corp|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.)(?<!\b(?:Mr|Mrs|Dr|Ms|St|Ave|Rd|Blvd|Ph|D|Jr|Sr|Co|Inc|Ltd|Corp|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\./).filter((sentence) => sentence.length > 0);
    return sentences;
  } else {
    const tokenizer = new Tokenizer();
    tokenizer.setEntry(content);
    const sentences = tokenizer.getSentences();
    return sentences;
  }
}

export function levelCalculation(xp: number) {
  const levels = [
    { min: 0, max: 4999, cefrLevel: "A0-", raLevel: 0 },
    { min: 5000, max: 10999, cefrLevel: "A0", raLevel: 1 },
    { min: 11000, max: 17999, cefrLevel: "A0+", raLevel: 2 },
    { min: 18000, max: 25999, cefrLevel: "A1", raLevel: 3 },
    { min: 26000, max: 34999, cefrLevel: "A1+", raLevel: 4 },
    { min: 35000, max: 44999, cefrLevel: "A2-", raLevel: 5 },
    { min: 45000, max: 55999, cefrLevel: "A2", raLevel: 6 },
    { min: 56000, max: 67999, cefrLevel: "A2+", raLevel: 7 },
    { min: 68000, max: 80999, cefrLevel: "B1-", raLevel: 8 },
    { min: 81000, max: 94999, cefrLevel: "B1", raLevel: 9 },
    { min: 95000, max: 109999, cefrLevel: "B1+", raLevel: 10 },
    { min: 110000, max: 125999, cefrLevel: "B2-", raLevel: 11 },
    { min: 126000, max: 142999, cefrLevel: "B2", raLevel: 12 },
    { min: 143000, max: 160999, cefrLevel: "B2+", raLevel: 13 },
    { min: 161000, max: 179999, cefrLevel: "C1-", raLevel: 14 },
    { min: 180000, max: 199999, cefrLevel: "C1", raLevel: 15 },
    { min: 200000, max: 220999, cefrLevel: "C1+", raLevel: 16 },
    { min: 221000, max: 242999, cefrLevel: "C2-", raLevel: 17 },
    { min: 243000, max: 243000, cefrLevel: "C2", raLevel: 18 },
  ];

  for (let level of levels) {
    if (xp >= level.min && xp <= level.max) {
      return { cefrLevel: level.cefrLevel, raLevel: level.raLevel };
    }
  }

  return { cefrLevel: "", raLevel: "" };
}

//function to get cefrLevel and xp from firebase
export async function getPreviousData(userId: string) {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    if (response.status === 400) {
      throw new Error("User not found");
    }
    const data = response.data;
    const cefrLevel = data.data.cefrLevel;
    const previousXp = data.data.xp;
    // console.log("data", data);
    return { cefrLevel, previousXp };
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function updateScore(
  xp: number,
  userId: string,
  updateSession?: Function
) {
  try {
    const previousData = await getPreviousData(userId);
    const cefrLevel = previousData?.cefrLevel;
    let previousXp = previousData?.previousXp;
    let newScore = 0;

    if (cefrLevel === "") {
      //increase new xp with 0
      previousXp = 0;
      newScore = previousXp + xp;
    } else {
      // increase new xp with actual new xp
      newScore = previousXp + xp;
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

    return new Response(
      JSON.stringify({
        message: "success",
      }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error,
      }),
      { status: 501 }
    );
  }
}

// updateScore(10000, "1234");


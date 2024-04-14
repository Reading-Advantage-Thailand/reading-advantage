/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useScopedI18n } from "@/locales/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { flatten } from "lodash";
import subtlex from "subtlex-word-frequencies";
import { Header } from "./header";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { updateScore } from "@/lib/utils";
import { Icons } from "./icons";
import { splitTextIntoSentences } from "@/lib/utils";
import { Sentence } from "./dnd/types";
import { wordFrequenciesConfig } from "@/constants/word-frequencies";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

type Props = {
  userId: string;
};

type RootObject = {
  textArrayId: number;
  resultTextArray?: ResultTextArray[] | null;
};
type SubtlexResult = {
  word: string;
  count: number;
};
type ResultTextArray = {
  subtlexResult: SubtlexResult;
  indexWord: number;
};

export default function ClozeTest({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tc = useScopedI18n("components.articleContent");
  const router = useRouter();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isplaying, setIsPlaying] = React.useState(false);
  const [articleBeforeRandom, setArticleBeforeRandom] = useState<any[]>([]);

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);

      // step 1 : sort Article sentence: ID and SN due date expired
      const closest = res.data.sentences.sort((a: Sentence, b: Sentence) => {
        return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
      });

      const newTodos = [...articleBeforeRandom];

      // step 2 : เรียงลำดับค่า sn สำหรับแต่ละ articleId
      for (const article of closest) {
        let resultList = await getArticle(article?.articleId, article?.sn);
        console.log("🚀 ~ getUserSentenceSaved ~ resultList:", resultList);
        newTodos.push(resultList);
      }

      setArticleBeforeRandom(flatten(newTodos));
    } catch (error) {
      console.log(error);
    }
  };

  const getArticle = async (articleId: string, sn: number) => {
    const res = await axios.get(`/api/articles/${articleId}`);
    const textList = await splitTextIntoSentences(res.data.article.content);

    // step 3 : find data split text, text count max level, position text max level, position text for show and replace dropdown
    const dataSplit = [sn].map((index) => {
      let result: string[] = [];

      // กำหนดว่าสามารถรวมประโยคได้กี่ประโยคเหนือ index ปัจจุบัน;
      let sentencesAbove = index;

      // กำหนดว่าสามารถรวมประโยคได้กี่ประโยคใต้ index ปัจจุบัน;
      let sentencesBelow = textList.length - index - 1;

      // คำนวณ m ตามจำนวนประโยคที่มีอยู่ด้านบนและด้านล่าง
      let m = Math.min(sentencesAbove, 4);
      let n = 4 - m;

      // ถ้าดัชนีปัจจุบันอยู่ที่หรือใกล้กับตอนท้ายแล้ว ให้ปรับ m และ n ตามที่เหมาะสม
      if (sentencesBelow < n) {
        n = sentencesBelow;
        m = Math.min(4, sentencesAbove + (4 - n));
      }

      let from = Math.max(index - m, 0);
      let to = Math.min(index + n + 1, textList.length);

      // เพิ่มช่วงของประโยคที่เลือกไปยังอาร์เรย์ผลลัพธ์
      result = textList.slice(from, to);
      // console.log("🚀 ~ dataSplit ~ result:", result);

      // แบ่งประโยคออกเป็นคำ
      const textArraySplit = result.map((text, index) => {
        return {
          id: index,
          textSplit: text.split(" "),
        };
      });

      // สร้างอาร์เรย์ของคำที่จะใช้แทนที่ โดยเลือกคำที่มีความถี่สูงสุด
      const textCountSplit = textArraySplit?.map((textArray) => {
        // ใช้ map ที่นี่เพื่อ return อาร์เรย์ของผลลัพธ์จากการประมวลผลแต่ละคำ
        const resultTextArray = textArray?.textSplit?.map(
          (word: string, index) => {
            let wordReplace = word.replace(/(?<!\w)'|'(?!\w)|[?.",!]+/g, "");

            // คำนวณความถี่ของคำ
            const result: any = subtlex?.filter(
              ({ word }) => word === wordReplace.toLowerCase()
            )[0];

            return {
              subtlexResult: result,
              indexWord: index,
            };
          }
        );
        return { textArrayId: textArray.id, resultTextArray };
      });
      const minCountByList = textCountSplit && findMinimumCount(textCountSplit);
      // console.log(
      //   "🚀 ~ getArticle ~ swapWordPositions minCountByList:",
      //   swapWordPositions(minCountByList)
      // );

      return {
        title: res.data.article.title,
        surroundingSentences: result,
        index,
        articleId,
        textCountSplit, // คำในแต่ละประโยคที่มีการแยกออกมา
        minCountByList, // คำในแต่ละประโยคที่มีความถี่ต่ำสุด
      };
    });

    return dataSplit;
  };

  const findMinimumCount = (data: any) => {
    const results = data?.map((group: RootObject) => {
      let minCount = Number.MAX_SAFE_INTEGER; // Initialize minCount as the highest possible number for comparison
      let minWord = {};
      group?.resultTextArray?.forEach((wordInfo: ResultTextArray) => {
        const count = wordInfo?.subtlexResult?.count;
        if (count < minCount) {
          minCount = count; // Update minCount if the current count is less than the stored minCount
          minWord = wordInfo;
        }
      });

      // Return undefined for this group if found, otherwise return the minCount found
      return minWord; //minCount;
    });

    return results;
  };

  const swapWordPositions = (words: any, index1: any, index2: any) => {
    console.log("🚀 ~ swapWordPositions ~ words, index1, index2 :", words, index1, index2)
    if (index1 < words.length && index2 < words.length) {
      let temp = words[index1];
      words[index1] = words[index2];
      words[index2] = temp;
    } else {
      console.log("Indices are out of the array's bounds");
    }
  }

  console.log("🚀 ~ ClozeTest ~ articleBeforeRandom:", articleBeforeRandom);

  return (
    <>
      <Header
        heading={t("ClozeTestPractice.ClozeTest")}
        text={t("ClozeTestPractice.ClozeTestDescription")}
      />
      <div className="mt-5"></div>
    </>
  );
}

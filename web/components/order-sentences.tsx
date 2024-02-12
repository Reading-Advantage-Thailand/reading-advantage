/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useScopedI18n } from "@/locales/client";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Header } from "./header";
import { toast } from "./ui/use-toast";
import { splitToText } from "@/lib/utils";

type Props = {
  userId: string;
};

type Sentence = {
  articleId: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  endTimepoint: number;
  sentence: string;
  sn: number;
  timepoint: number;
  translation: { th: string };
  userId: string;
  id: string;
};

type Article = {
  text?: string;
  begin: number;
};


export default function OrderSentences({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  // const [sentences, setSentences] = useState<Sentence[]>([]);
  const [articleBeforeRandom, setArticleBeforeRandom] = useState<any[]>([]);
  const [articleRandom, setArticleRandom] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article[]>([]);

  // ฟังก์ชันเพื่อค้นหา text ก่อน, ณ ลำดับนั้น, และหลังลำดับ
  const findTextsByIndexes = (objects: Article[], targetIndexes: number[]) => {
    return targetIndexes.map((index: number) => {
      const before =
        index - 1 >= 0
          ? { index: index - 1, text: objects[index - 1]?.text }
          : null; //index - 1 >= 0 ? objects[index - 1]?.text : "ไม่มีข้อมูล";
      const current = { index: index, text: objects[index]?.text };
      const after =
        index + 1 < objects.length
          ? { index: index + 1, text: objects[index + 1]?.text }
          : null;
      return { before, current, after };
    });
  };

  // สร้างฟังก์ชันเพื่อจัดการข้อมูล
  const processDynamicData = (data: any) => {
    // ใช้ Map เพื่อจัดการการซ้ำของข้อมูล
    const uniqueTexts = new Map();

    // วนลูปเพื่อดึงข้อมูลจากแต่ละส่วน
    data.forEach((group: any) => {
      // ดึงข้อมูล before, current, after และเพิ่มลงใน Map
      [group?.before, group?.current, group?.after].forEach((item) => {
        if (item !== null) {
          uniqueTexts.set(item?.index, item?.text);
        }
      });
    });

    // แปลง Map เป็น Array และเรียงลำดับตาม index
    return Array.from(uniqueTexts.keys())
      .sort((a, b) => a - b)
      .map((index) => ({
        index,
        text: uniqueTexts.get(index),
      }));
  };

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const getArticle = async (articleId: string, sn: number[]) => {
    const res = await axios.get(`/api/articles/${articleId}`);
    const textList = await splitToText(res.data.article);
    const resultsFindTexts = await findTextsByIndexes(textList, sn);
    const resultsProcess = await processDynamicData(resultsFindTexts);
    return resultsProcess;
  };

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);
      // step 1: get the article id and get sn
      const objectSentence: Sentence[] = res.data.sentences;

      // step 2 : create map articleId และ Array ของ sn
      const articleIdToSnMap: { [key: string]: number[] } =
        objectSentence.reduce((acc: { [key: string]: number[] }, article) => {
          if (!acc[article.articleId]) {
            acc[article.articleId] = [article.sn];
          } else {
            acc[article.articleId].push(article.sn);
          }
          return acc;
        }, {});

      // step 3 : เรียงลำดับค่า sn สำหรับแต่ละ articleId
      for (const articleId in articleIdToSnMap) {
        articleIdToSnMap[articleId].sort((a, b) => a - b);
      }

      // step 4 : get sentence from articleId and sn
      const newTodos = [...articleBeforeRandom];
      for (const articleId in articleIdToSnMap) {
        let resultList = await getArticle(
          articleId,
          articleIdToSnMap[articleId]
        );
        newTodos.push(resultList);
      }
      setArticleBeforeRandom(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  console.log("articleBeforeRandom : ", articleBeforeRandom);
  /*
  [
    {
        "index": 0,
        "text": "Once upon a time, in a small town called Harmonyville, there were two best friends named Lily and Emma."
    },
    {
        "index": 1,
        "text": "They were both in the fifth grade at Harmony Elementary School."
    },
    {
        "index": 2,
        "text": "Lily had curly brown hair and bright blue eyes, while Emma had long blonde hair and sparkling green eyes."
    },
    {
        "index": 3,
        "text": "They were inseparable and did everything together."
    },
    {
        "index": 4,
        "text": "One day, they noticed something troubling happening at their school."
    }
]
  
  */

  return (
    <>
      <Header
        heading={t("OrderSentences")}
        text={t("OrderSentencesDescription")}
      />
      <div>{JSON.stringify(articleBeforeRandom)}</div>
    </>
  );
}

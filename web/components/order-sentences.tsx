/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
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
import { useScopedI18n } from "@/locales/client";
import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";

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

export default function OrderSentences({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  // artical id : 1KOLOxdy7aCsf3CrClj3
  const  getArticle = async (articleId: string, sn: number[]) => {
    const res = await axios.get(`/api/articles/${articleId}`);
    console.log("getArticle : ", res.data);
  }

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
      for (const articleId in articleIdToSnMap) {
        getArticle(articleId, articleIdToSnMap[articleId]);
      }

      console.log(articleIdToSnMap);

      /*
      const targetArticleId = "1KOLOxdy7aCsf3CrClj3";
const targetSn = 10;

// ค้นหา sentences ใน articleId ที่กำหนด
const sentencesInArticle = articles.filter(article => article.articleId === targetArticleId);

// เรียงลำดับตาม sn
sentencesInArticle.sort((a, b) => a.sn - b.sn);

// ค้นหา index ของ sentence ที่มี sn เท่ากับ targetSn
const targetIndex = sentencesInArticle.findIndex(article => article.sn === targetSn);

// ดึง sentence ก่อนและหลัง
const prevSentence = targetIndex > 0 ? sentencesInArticle[targetIndex - 1].sentence : null;
const nextSentence = targetIndex < sentencesInArticle.length - 1 ? sentencesInArticle[targetIndex + 1].sentence : null;

console.log(`Previous sentence: ${prevSentence}`);
console.log(`Next sentence: ${nextSentence}`);
      */

      // setSentences(res.data); // Extract the response data and pass it to setSentences
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  console.log(sentences);

  return (
    <>
      <Header
        heading={t("OrderSentences")}
        text={t("OrderSentencesDescription")}
      />
    </>
  );
}

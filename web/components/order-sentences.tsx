/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { formatDate } from "@/lib/utils";
import { Header } from "./header";
import { toast } from "./ui/use-toast";
import { useScopedI18n } from "@/locales/client";
import { v4 as uuidv4 } from "uuid";

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

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);
      setSentences(res.data); // Extract the response data and pass it to setSentences
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

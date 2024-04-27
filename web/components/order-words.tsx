/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { flatten } from "lodash";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs_plugin_isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useScopedI18n } from "@/locales/client";
import { Header } from "./header";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { updateScore } from "@/lib/utils";
import { Sentence } from "./dnd/types";
import { Icons } from "./icons";
import { splitTextIntoSentences } from "@/lib/utils";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);

type Props = {
  userId: string;
};

export default function OrderWords({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tc = useScopedI18n("components.articleContent");
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isplaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [articleOrderWords, setArticleOrderWords] = useState<any[]>([]);

  return (
    <>
      <Header
        heading={t("orderWordsPractice.orderWords")}
        text={t("orderWordsPractice.orderWordsDescription")}
      />
      <div className="mt-5"></div>
    </>
  );
}

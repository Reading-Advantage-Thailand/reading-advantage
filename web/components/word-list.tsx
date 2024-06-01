"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import axios from "axios";
import { useScopedI18n } from "@/locales/client";
import { Article } from "@/components/models/article-model";
import { Button } from "./ui/button";

interface Props {
  article?: Article;
}

export default function WordList({ article }: Props) {
  const t = useScopedI18n("components.wordList");

  return (
    <>
      <Button onClick={() => {}} className="mb-4 ml-3">
        {t("title")}
      </Button>
    </>
  );
}

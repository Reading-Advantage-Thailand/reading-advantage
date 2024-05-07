import { articleShowcaseType } from "@/types";
import React from "react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { camelToSentenceCase } from "@/lib/utils";
import { Rating } from "@mui/material";

type Props = {
  article: articleShowcaseType;
};

export default async function ArticleShowcaseCard({ article }: Props) {
  return (
    <Link href={`/student/read/${article.id}`}>
      <div
        className="w-full flex flex-col gap-1 h-[20rem] bg-cover bg-center p-3 rounded-md hover:scale-105 transition-all duration-300 bg-black "
        style={{
          backgroundImage: `url('https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${article.id}.png')`,
          boxShadow: "inset 80px 10px 90px 10px rgba(0, 0, 0, 0.9)",
          opacity: article.is_read ? 0.3 : 1,
        }}
      >
        <Badge className="shadow-lg max-w-max" variant="destructive">
          Reading Advantage Level: {article.ra_level}
        </Badge>
        <Badge className="shadow-lg max-w-max" variant="destructive">
          CEFR Level: {article.cefr_level}
        </Badge>
        <Badge className="shadow-lg max-w-max" variant="destructive">
          <Rating name="read-only" value={article.average_rating} readOnly />
        </Badge>
        <div className="mt-auto">
          <p className="text-xl drop-shadow-lg font-bold text-white">
            {article.title}
          </p>
          <p className="text-sm drop-shadow-lg line-clamp-4">
            {article.summary}
          </p>
        </div>
      </div>
      {article.is_read && (
        <div className="flex justify-center">
          <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
            Previously Read
          </Badge>
        </div>
      )}
    </Link>
  );
}

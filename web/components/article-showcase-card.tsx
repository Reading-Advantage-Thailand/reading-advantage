import React from "react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Rating } from "@mui/material";
import { ArticleShowcase } from "./models/article-model";
import axios from "axios";
import { useCurrentLocale } from "@/locales/client";
import { usePathname } from "next/navigation";

type Props = {
  article: ArticleShowcase;
};

async function getTranslate(
  sentences: string[],
  articleId: string,
  language: string
) {
  const res = await axios.post(
    `/api/articles/${articleId}/translate/google/summary`,
    {
      sentences,
      language,
    }
  );
  return res.data;
}

const ArticleShowcaseCard = ({ article }: Props) => {
  const [summarySentence, setSummarySentence] = React.useState<string[]>([]);
  const locale = useCurrentLocale();
  const pathName = usePathname();
  const systemPathRegex = /\/(?:[a-z]{2}\/)?system\/?$/i;

  React.useEffect(() => {
    handleTranslateSummary();
  }, [article, locale]);

  async function handleTranslateSummary() {
    const articleId = article.id;
    if (!locale || locale === "en") {
      return;
    }
    type ExtendedLocale = "th" | "cn" | "tw" | "vi" | "zh-CN" | "zh-TW";
    let localeTarget: ExtendedLocale = locale as ExtendedLocale;

    switch (locale) {
      case "cn":
        localeTarget = "zh-CN";
        break;
      case "tw":
        localeTarget = "zh-TW";
        break;
    }
    const res = await getTranslate([article.summary], articleId, localeTarget);

    setSummarySentence(res.translation);
  }

  return (
    <Link href={`/student/read/${article.id}`}>
      <div
        className="w-full flex flex-col gap-1 h-[20rem] bg-cover bg-center p-3 rounded-md hover:scale-105 transition-all duration-300 bg-black "
        style={{
          backgroundImage: `url('https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${article.id}.png')`,
          boxShadow: "inset 80px 10px 90px 10px rgba(0, 0, 0, 0.9)",
          opacity:
            article.is_read ||
            (article.is_approved && systemPathRegex.test(pathName))
              ? 0.3
              : 1,
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
          <div className=" bg-black bg-opacity-40">
            <p className="text-sm drop-shadow-lg line-clamp-4 text-white">
              {locale == "en" ? (
                <p>{article.summary}</p>
              ) : (
                <p>{summarySentence}</p>
              )}
            </p>
          </div>
        </div>
      </div>
      {article.is_read && (
        <div className="flex justify-center">
          <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
            Previously Read
          </Badge>
        </div>
      )}

      {article.is_approved && systemPathRegex.test(pathName) && (
        <div className="flex justify-center">
          <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
            Approved
          </Badge>
        </div>
      )}
    </Link>
  );
};
export default React.memo(ArticleShowcaseCard);

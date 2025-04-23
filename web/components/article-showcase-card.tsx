import React from "react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Rating } from "@mui/material";
import { ArticleShowcase } from "./models/article-model";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import { usePathname } from "next/navigation";
import { ActivityType, ActivityStatus } from "./models/user-activity-log-model";

type Props = {
  article: ArticleShowcase;
  userId?: string;
};

async function getTranslateSentence(
  articleId: string,
  targetLanguage: string
): Promise<{ message: string; translated_sentences: string[] }> {
  try {
    const res = await fetch(`/api/v1/assistant/translate/${articleId}`, {
      method: "POST",
      body: JSON.stringify({ type: "summary", targetLanguage }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { message: "error", translated_sentences: [] };
  }
}

const ArticleShowcaseCard = React.forwardRef<HTMLDivElement, Props>(
  ({ article, userId }, ref) => {
    const [summarySentence, setSummarySentence] = React.useState<string[]>([]);
    const locale = useCurrentLocale();
    const pathName = usePathname();
    const systemPathRegex = /\/(?:[a-z]{2}\/)?system\/.*\/?$/i;
    const t: string | any = useScopedI18n("selectType.types");

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

      const data = await getTranslateSentence(articleId, localeTarget);

      setSummarySentence(data.translated_sentences);
    }

    const onClickLesson = () => {
      console.log("Lesson clicked");
    };

    return (
      <div
        className="relative hover:scale-105 transition-all duration-300"
        ref={ref}
      >
        <div
          className="absolute top-2 right-2 z-10"
          style={{
            opacity:
              article.is_read ||
              (article.is_approved && systemPathRegex.test(pathName))
                ? 0.3
                : 1,
          }}
        >
          <Link
            href={`/student/lesson/${article.id}`}
            onClick={() =>
              fetch(`/api/v1/users/${userId}/activitylog`, {
                method: "POST",
                body: JSON.stringify({
                  articleId: article.id,
                  activityType: ActivityType.LessonRead,
                  activityStatus: ActivityStatus.InProgress,
                  details: {
                    title: article.title,
                    level: article.ra_level,
                    cefr_level: article.cefr_level,
                    type: article.type,
                    genre: article.genre,
                    subgenre: article.subgenre,
                  },
                }),
              })
            }
          ></Link>
          <Badge
            className={`text-white text-sm px-3 py-3 shadow-md ${
              article.is_read
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={!article.is_read ? onClickLesson : undefined}
            variant="destructive"
          >
            ▶ Study as 45-min Lesson
          </Badge>
        </div>

        <Link
          href={`/student/read/${article.id}`}
          onClick={() =>
            fetch(`/api/v1/users/${userId}/activitylog`, {
              method: "POST",
              body: JSON.stringify({
                articleId: article.id,
                activityType: ActivityType.ArticleRead,
                activityStatus: ActivityStatus.InProgress,
                details: {
                  title: article.title,
                  level: article.ra_level,
                  cefr_level: article.cefr_level,
                  type: article.type,
                  genre: article.genre,
                  subgenre: article.subgenre,
                },
              }),
            })
          }
        >
          <div
            ref={ref}
            className="w-full flex flex-col gap-1 h-[20rem] bg-cover bg-center p-3 rounded-md bg-black "
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
            {article.ra_level && (
              <Badge className="shadow-lg max-w-max" variant="destructive">
                Reading Advantage Level: {article.ra_level}
              </Badge>
            )}
            <Badge className="shadow-lg max-w-max" variant="destructive">
              CEFR Level: {article.cefr_level}
            </Badge>
            <Badge className="shadow-lg max-w-max" variant="destructive">
              {t(article.genre)}, {t(article.subgenre)}
            </Badge>
            <Badge className="shadow-lg max-w-max" variant="destructive">
              <Rating
                name="read-only"
                value={article.average_rating}
                readOnly
              />
            </Badge>
            <div className="mt-auto">
              <div className=" bg-black bg-opacity-40">
                <p className="text-xl drop-shadow-lg font-bold text-white">
                  {article.title}
                </p>
              </div>
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
          {article.is_read && !article.is_completed && (
            <div className="flex justify-center">
              <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
                Started
              </Badge>
            </div>
          )}

          {article.is_read && article.is_completed && (
            <div className="flex justify-center">
              <Badge className="relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900">
                Completed
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
      </div>
    );
  }
);

ArticleShowcaseCard.displayName = "ArticleShowcaseCard";

export default React.memo(ArticleShowcaseCard);

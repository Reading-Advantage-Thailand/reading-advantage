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
import { Header } from "./header";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { updateScore } from "@/lib/utils";
import { Icons } from "./icons";
import { splitTextIntoSentences } from "@/lib/utils";
import { Sentence } from "./dnd/types";
dayjs.extend(utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);
import subtlex from "subtlex-word-frequencies"

type Props = {
  userId: string;
};

export default function ClozeTest({ userId }: Props) {
  const t = useScopedI18n("pages.student.practicePage");
  const tc = useScopedI18n("components.articleContent");
  const router = useRouter();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isplaying, setIsPlaying] = React.useState(false);
  const [articleBeforeSelect, setArticleBeforeSelect] = useState<any[]>([]);
  const [articleBeforeRandom, setArticleBeforeRandom] = useState<any[]>([]);
  const [articleRandom, setArticleRandom] = useState<any[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const tUpdateScore = useScopedI18n(
    "pages.student.practicePage.flashcardPractice"
  );

  useEffect(() => {
    getUserSentenceSaved();
  }, []);

  const getUserSentenceSaved = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/sentences`);

      // step 1 : find Article sentence: ID and SN due date expired
      const closest = res.data.sentences.sort((a: Sentence, b: Sentence) => {
        return dayjs(a.due).isAfter(dayjs(b.due)) ? 1 : -1;
      });

      const newTodos = [...articleBeforeRandom];

      // step 3 : เรียงลำดับค่า sn สำหรับแต่ละ articleId
      for (const article of closest) {
        let resultList = await getArticle(article?.articleId, article?.sn);
        newTodos.push(resultList);
      }

      console.log("🚀 ~ getUserSentenceSaved ~ newTodos:", newTodos);
      console.log(
        "🚀 ~ getUserSentenceSaved ~ flatten(newTodos):",
        flatten(newTodos)
      );

      /**
       const splitText = text.replace(/["",.]/g, '').split(' ');
console.log(splitText);
       */
      let arr = [
        "On",
        "his",
        "way",
        "to",
        "the",
        "market",
        "the",
        "boy",
        "met",
        "an",
        "old",
        "man",
        "who",
        "asked",
        "him",
        "what",
        "he",
        "was",
        "carrying",
      ];

      //   const result = arr.map((word) => {
      //     return {
      //       word: word,
      //       difficulty: difficulty.getLevel(word),
      //     };
      //   });
      // console.log("🚀 ~ getUserSentenceSaved ~ result:", result);
      subtlex.forEach(function (d) {
        if (d.word === "carrying") {
          console.log("🚀 ~ getUserSentenceSaved ~ d:", d);
        }
      });
      setArticleBeforeRandom(flatten(newTodos));
    } catch (error) {
      console.log(error);
    }
  };

  const getArticle = async (articleId: string, sn: number) => {
    const res = await axios.get(`/api/articles/${articleId}`);
    const textList = await splitTextIntoSentences(res.data.article.content);

    const dataSplit = [sn].map((index) => {
      let result: any[] = [];

      // Determine how many sentences can be included above the current index
      let sentencesAbove = index;

      // Determine how many sentences can be included below the current index
      let sentencesBelow = textList.length - index - 1;

      // Calculate m based on available sentences above and below
      let m = Math.min(sentencesAbove, 4);
      let n = 4 - m;

      // If the current index is at or near the end, adjust m and n accordingly
      if (sentencesBelow < n) {
        n = sentencesBelow;
        m = Math.min(4, sentencesAbove + (4 - n));
      }

      let from = Math.max(index - m, 0);
      let to = Math.min(index + n + 1, textList.length);

      // Add the selected range of sentences to the result array
      result = textList.slice(from, to);
      console.log("🚀 ~ dataSplit ~ result:", result)

      return {
        index: index,
        title: res.data.article.title,
        surroundingSentences: result,
        articleId,
      };
    });

    return dataSplit;
  };

  //=====> play audio
  const handlePause = () => {
    setIsPlaying(!isplaying);
    if (audioRef.current === null) return;
    if (isplaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  const onNextArticle = async () => {
    setLoading(true);
    let isEqual = true;

    for (
      let i = 0;
      i < articleBeforeRandom[currentArticleIndex].surroundingSentences.length;
      i++
    ) {
      if (
        articleBeforeRandom[currentArticleIndex].surroundingSentences[i] !==
        articleRandom[currentArticleIndex].surroundingSentences[i]
      ) {
        isEqual = false;
        break;
      }
    }

    if (isEqual) {
      try {
        const updateScrore = await updateScore(15, userId);
        if (updateScrore?.status === 201) {
          toast({
            title: t("toast.success"),
            description: tUpdateScore("yourXp", { xp: 5 }),
          });
          setCurrentArticleIndex(currentArticleIndex + 1);
          router.refresh();
          setIsPlaying(false);
        }
      } catch (error) {
        toast({
          title: t("toast.error"),
          description: t("toast.errorDescription"),
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: t("toast.error"),
        description: t("OrderSentencesPractice.errorOrder"),
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  /*
  const [text, setText] = useState(
    "React is a JavaScript library for building user interfaces."
  );
  
  const [answers, setAnswers] = useState(
    Array(text.split(" ").length).fill("")
  );

  const handleChange = (index, event) => {
    const newAnswers = [...answers];
    newAnswers[index] = event.target.value;
    setAnswers(newAnswers);
  };

   const handleSubmit = (event) => {
     event.preventDefault();
     // Logic to check answers or perform further actions
     console.log("Submitted Answers:", answers);
   };

   const generateClozeText = () => {
     return text.split(" ").map((word, index) => (
       <span key={index}>
         {answers[index] ? answers[index] : "_____"}{" "}
         <input
           type="text"
           value={answers[index]}
           onChange={(e) => handleChange(index, e)}
         />
       </span>
     ));
   };
   */

  return (
    <>
      <Header
        heading={t("ClozeTestPractice.ClozeTest")}
        text={t("ClozeTestPractice.ClozeTestDescription")}
      />
      <div className="mt-5">
        {articleBeforeRandom.length === 0 ? (
          <div className="grid w-full gap-10">
            <div className="mx-auto w-[800px] space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[20px] w-2/3" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[20px] w-full" />
            </div>
          </div>
        ) : (
          <>
            {articleBeforeRandom.length !== currentArticleIndex ? (
              <div className="bg-[#2684FFß] flex max-w-screen-lg">
                <div className="flex flex-col h-full w-screen overflow-auto  bg-[#DEEBFF] dark:text-white dark:bg-[#1E293B]">
                  <div className="flex justify-between items-center">
                    <h4 className="py-4 pl-5 font-bold">
                      {articleBeforeRandom[currentArticleIndex]?.title}
                    </h4>
                    <div className="mr-5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handlePause}
                      >
                        {isplaying ? (
                          <Icons.pause className="mr-1" size={12} />
                        ) : (
                          <Icons.play className="mr-1" size={12} />
                        )}
                        {isplaying
                          ? tc("soundButton.pause")
                          : tc("soundButton.play")}
                      </Button>
                      <audio
                        ref={audioRef}
                        key={
                          articleBeforeRandom[currentArticleIndex]
                            ?.surroundingSentences
                        }
                      >
                        <source
                          src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${articleBeforeRandom[currentArticleIndex]?.articleId}.mp3`}
                        />
                      </audio>
                    </div>
                  </div>

                  <div className="p-5 bg-[#EBECF0]">
                    {articleBeforeRandom[
                      currentArticleIndex
                    ]?.surroundingSentences.map(
                      (sentence: string, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg border-solid shadow-transparent box-border p-8 min-h-10 mb-8  select-none color-[#091e42]"
                        >
                          {sentence}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            {articleBeforeRandom.length != currentArticleIndex ? (
              <Button
                className="mt-4"
                variant="outline"
                disabled={loading}
                size="sm"
                onClick={onNextArticle}
              >
                {t("OrderSentencesPractice.saveOrder")}
              </Button>
            ) : (
              <Button
                className="mt-4"
                variant="outline"
                disabled={true}
                size="sm"
                onClick={onNextArticle}
              >
                {t("OrderSentencesPractice.saveOrder")}
              </Button>
            )}
          </>
        )}
      </div>
      {/* <div>
        <h2>Cloze Activity</h2>
        <form onSubmit={handleSubmit}>
          <p>{generateClozeText()}</p>
          <button type="submit">Submit</button>
        </form>
      </div> */}
      {/* <div className="mt-5">
        {articleBeforeRandom.length === 0 ? (
          <div className="grid w-full gap-10">
            <div className="mx-auto w-[800px] space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[20px] w-2/3" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[20px] w-full" />
            </div>
          </div>
        ) : (
          <>
            {articleBeforeRandom.length !== currentArticleIndex ? (
              <div className="bg-[#2684FFß] flex max-w-screen-lg">
                <div className="flex flex-col h-full w-screen overflow-auto  bg-[#DEEBFF] dark:text-white dark:bg-[#1E293B]">
                  <div className="flex justify-between items-center">
                    <h4 className="py-4 pl-5 font-bold">
                      {articleBeforeRandom[currentArticleIndex]?.title}
                    </h4>
                    <div className="mr-5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handlePause}
                      >
                        {isplaying ? (
                          <Icons.pause className="mr-1" size={12} />
                        ) : (
                          <Icons.play className="mr-1" size={12} />
                        )}
                        {isplaying
                          ? tc("soundButton.pause")
                          : tc("soundButton.play")}
                      </Button>
                      <audio
                        ref={audioRef}
                        key={
                          articleBeforeRandom[currentArticleIndex]
                            ?.surroundingSentences
                        }
                      >
                        <source
                          src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${articleBeforeRandom[currentArticleIndex]?.articleId}.mp3`}
                        />
                      </audio>
                    </div>
                  </div>

                  <div className="p-5 bg-[#EBECF0]">
                    {articleBeforeRandom[
                      currentArticleIndex
                    ]?.surroundingSentences.map(
                      (sentence: string, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg border-solid shadow-transparent box-border p-8 min-h-10 mb-8  select-none color-[#091e42]"
                        >
                          {sentence}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            {articleBeforeRandom.length != currentArticleIndex ? (
              <Button
                className="mt-4"
                variant="outline"
                disabled={loading}
                size="sm"
                onClick={onNextArticle}
              >
                {t("OrderSentencesPractice.saveOrder")}
              </Button>
            ) : (
              <Button
                className="mt-4"
                variant="outline"
                disabled={true}
                size="sm"
                onClick={onNextArticle}
              >
                {t("OrderSentencesPractice.saveOrder")}
              </Button>
            )}
          </>
        )}
      </div> */}
    </>
  );
}

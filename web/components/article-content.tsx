"use client";
import React, { useState, useEffect, useRef } from "react";
import { Article } from "./models/article-model";
import { cn, splitTextIntoSentences } from "@/lib/utils";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { createEmptyCard, Card } from "ts-fsrs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import axios from "axios";
import { toast } from "./ui/use-toast";

type Props = {
  article: Article;
  articleId: string;
  userId: string;
  className?: string;
};

type Sentence = {
  sentence: string;
  index: number;
  startTime: number;
  endTime: number;
  audioUrl: string;
};

async function getTranslate(
  sentences: string[],
  articleId: string,
  language: string
) {
  const res = await axios.post(`/api/articles/${articleId}/translate/google`, {
    sentences,
    language,
  });
  return res.data;
}

export default function ArticleContent({
  article,
  className = "",
  userId,
}: Props) {
  console.log("article", article);
  const t = useScopedI18n("components.articleContent");
  const sentences = splitTextIntoSentences(article.passage, true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const sentenceList: Sentence[] = article.timepoints.map(
    (timepoint, index) => {
      const startTime = timepoint.timeSeconds;
      const endTime =
        index === article.timepoints.length - 1
          ? timepoint.timeSeconds + 10
          : article.timepoints[index + 1].timeSeconds - 0.3;
      return {
        sentence: sentences[index],
        index: timepoint.index,
        startTime,
        endTime,
        audioUrl: timepoint.file
          ? `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/tts/${timepoint.file}`
          : `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/tts/${article.id}.mp3`,
      };
    }
  );

  const handlePlayPause = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.log("Error playing audio: ", error);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      const currentSentence = sentenceList[currentAudioIndex];
      if (audioRef.current.currentTime >= currentSentence.endTime) {
        handleAudioEnded();
      }
    }
  };

  const handleSentenceClick = (startTime: number, audioIndex: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setCurrentAudioIndex(audioIndex);
      audioRef.current.src = sentenceList[audioIndex].audioUrl;
      audioRef.current.currentTime = startTime;
      const playAudio = () => {
        audioRef.current!.play().catch((error) => {
          console.log("Error playing audio: ", error);
        });
        audioRef.current!.removeEventListener("canplaythrough", playAudio);
      };
      audioRef.current.addEventListener("canplaythrough", playAudio);
      audioRef.current.load();
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    if (currentAudioIndex < sentenceList.length - 1) {
      const nextAudioIndex = currentAudioIndex + 1;
      setCurrentAudioIndex(nextAudioIndex);
      if (audioRef.current) {
        audioRef.current.src = sentenceList[nextAudioIndex].audioUrl;
        audioRef.current.load();
        const playAudio = () => {
          audioRef.current!.currentTime =
            sentenceList[nextAudioIndex].startTime;
          audioRef.current!.play().catch((error) => {
            console.log("Error playing audio: ", error);
          });
          audioRef.current!.removeEventListener("canplaythrough", playAudio);
        };
        audioRef.current.addEventListener("canplaythrough", playAudio);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const getHighlightedClass = (index: number) =>
    cn(
      "cursor-pointer text-muted-foreground hover:bg-blue-200 hover:dark:bg-blue-900 hover:text-primary rounded-md",
      currentAudioIndex === index &&
        isPlaying &&
        "bg-red-200 dark:bg-red-900 text-primary"
    );

  const renderSentence = (sentence: string, i: number) => {
    // if (!sentence) {
    //   return "";
    // }
    return sentence.split("~~").map((line, index, array) => (
      <span
        key={index}
        onClick={() => {
          setSelectedSentence(i);
          setSelectedIndex(i);
          console.log(i);
        }}
      >
        {line}
        {(index !== array.length - 1 || /[.!?]$/.test(line)) && " "}
        {index !== array.length - 1 && <div className="mt-3" />}
      </span>
    ));
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = sentenceList[currentAudioIndex].audioUrl;
      audioRef.current.currentTime = sentenceList[currentAudioIndex].startTime;
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentAudioIndex]);

  const [selectedSentence, setSelectedSentence] = React.useState<Number>(-1);
  const [loading, setLoading] = React.useState(false);
  const [translate, setTranslate] = React.useState<string[]>([]);
  const [isTranslate, setIsTranslate] = React.useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = React.useState(false);

  const saveToFlashcard = async () => {
    //translate before save
    if (!isTranslate) {
      await handleTranslateSentence();
    } else {
      try {
        let card: Card = createEmptyCard();
        let endTimepoint = 0;
        if (selectedSentence !== -1) {
          endTimepoint = sentenceList[selectedSentence as number].endTime;
        } else {
          endTimepoint = audioRef.current?.duration as number;
        }
        const res = await axios.post(`/api/users/${userId}/sentences`, {
          sentence: sentenceList[selectedSentence as number].sentence.replace(
            "~~",
            ""
          ),
          sn: selectedSentence,
          articleId: article.id,
          translation: {
            th: translate[selectedSentence as number],
          },
          audioUrl: sentenceList[selectedSentence as number].audioUrl,
          timepoint: sentenceList[selectedSentence as number].startTime,
          endTimepoint: endTimepoint,
          saveToFlashcard: true, // case ประโยคที่เลือกจะ save to flashcard
          ...card,
        });
        console.log(
          "audioUrl",
          sentenceList[selectedSentence as number].audioUrl
        );
        toast({
          title: "Success",
          description: `You have saved "${sentenceList[
            selectedSentence as number
          ].sentence.replace("~~", "")}" to flashcard`,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.data.message === "Sentence already saved") {
            toast({
              title: "Sentence already saved",
              description: "You have already saved this sentence.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Something went wrong.",
            description: "Your sentence was not saved. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };
  const locale = useCurrentLocale();

  async function handleTranslateSentence() {
    setLoading(true);
    try {
      //remove ~~ from text
      const sentences = sentenceList.map((sentence) =>
        sentence.sentence.replace(/~~/g, "")
      );
      // const sentences = text.map((sentence) => sentence.text);
      // get language from local
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

      const res = await getTranslate(sentences, article.id, localeTarget);

      if (res.message) {
        setIsTranslateOpen(false);
        toast({
          title: "Something went wrong.",
          description: res.message,
          variant: "destructive",
        });
        return;
      } else {
        setIsTranslateOpen(!isTranslateOpen);
        setTranslate(res.translation);
        setIsTranslate(true);
      }
    } catch (error) {
      console.log(error);
      setIsTranslate(false);
      setIsTranslateOpen(false);
      toast({
        title: "Something went wrong.",
        description: "Your sentence was not translated. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  const [isTranslateClicked, setIsTranslateClicked] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const handleTranslate = async () => {
    //if not translate, translate
    if (!isTranslate) {
      await handleTranslateSentence();
      setIsTranslateClicked(!isTranslateClicked);
    } else {
      //if translate, set isTranslate to false
      setIsTranslateClicked(!isTranslateClicked);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <p>{t("voiceAssistant")}</p>
          <Button size="sm" variant="secondary" onClick={handlePlayPause}>
            {isPlaying ? t("soundButton.pause") : t("soundButton.play")}
          </Button>
        </div>
        {locale !== "en" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleTranslateSentence}
            disabled={loading}
          >
            {loading
              ? "Loading"
              : isTranslate && isTranslateOpen
              ? t("translateฺButton.close")
              : t("translateฺButton.open")}
          </Button>
        )}
      </div>

      {/* show ที่แปลภาษาทีละประโยค */}
      {isTranslate && isTranslateOpen && (
        <div className="h-32 md:h-24 flex flex-col justify-between items-center">
          <Separator />
          {/* กรณีกดเล่นเสียง และกดแปล */}
          {isPlaying === true ? (
            <p className="text-center text-green-500">
              {translate[currentAudioIndex]}
            </p>
          ) : (
            <p className="text-center text-green-500">
              {translate[currentAudioIndex]}
            </p>
          )}
          <Separator />
        </div>
      )}
      <ContextMenu>
        <ContextMenuTrigger>
          {sentenceList.map((sentence, index) => (
            <span
              key={sentence.index}
              className={cn(
                selectedIndex === index && "bg-blue-200 dark:bg-blue-900",
                `${getHighlightedClass(index)}`
              )}
              onClick={() => handleSentenceClick(sentence.startTime, index)}
            >
              {renderSentence(sentence.sentence, index)}
            </span>
          ))}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
          >
            <source src={sentenceList[currentAudioIndex].audioUrl} />
          </audio>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {loading ? (
            <ContextMenuItem inset disabled>
              Loading
            </ContextMenuItem>
          ) : (
            <>
              <ContextMenuItem
                inset
                onClick={() => {
                  saveToFlashcard();
                }}
                disabled={loading}
              >
                Save to flashcard
              </ContextMenuItem>
              <ContextMenuItem
                inset
                onClick={() => {
                  handleTranslate();
                }}
                disabled={loading || locale === "en"}
              >
                Translate
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <AlertDialog open={isTranslateClicked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Translate</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                {selectedSentence !== -1
                  ? sentenceList[selectedSentence as number].sentence.replace(
                      "~~",
                      ""
                    )
                  : ""}
              </p>
              <p className="text-green-500 mt-3">{translate[selectedIndex]}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsTranslateClicked(false)}>
              Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

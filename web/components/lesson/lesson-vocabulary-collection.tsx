"use client";

import { useState, useEffect } from "react";
import { useScopedI18n } from "@/locales/client";
import { Book } from "lucide-react";
import { useCurrentLocale } from "@/locales/client";
import { Article } from "@/components/models/article-model";
import { Skeleton } from "@/components/ui/skeleton";
import { AUDIO_WORDS_URL } from "@/server/constants";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "@/components/ui/use-toast";
import AudioImg from "../audio-img";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createEmptyCard, Card as FsrsCard } from "ts-fsrs";
import { filter, includes, set } from "lodash";
import { Button } from "@/components/ui/button";

interface Props {
  article: Article;
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}

interface WordList {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
  index: number;
  startTime: number;
  endTime: number;
  audioUrl: string;
}

export default function LessonWordCollection({
  article,
  articleId,
  userId,
  onCompleteChange,
}: Props) {
  const t = useScopedI18n("pages.student.lessonPage");
  const [loading, setLoading] = useState<boolean>(false);
  const [wordList, setWordList] = useState<WordList[]>([]);
  const [savedWordlistCount, setSavedWordlistCount] = useState(0);

  const FormSchema = z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      let card: FsrsCard = createEmptyCard();
      const foundWordsList = filter(wordList, (vocab) =>
        includes(data?.items, vocab?.vocabulary)
      );

      if (foundWordsList.length < 5) {
        toast({
          title: "คำศัพท์ไม่ครบ",
          description: "กรุณาเลือกคำศัพท์อย่างน้อย 5 คำ",
          variant: "destructive",
        });
        return;
      }

      if (foundWordsList.length > 0) {
        const param = {
          ...card,
          articleId: articleId,
          saveToFlashcard: true,
          foundWordsList: foundWordsList,
        };

        const res = await fetch(`/api/v1/users/wordlist/${userId}`, {
          method: "POST",
          body: JSON.stringify(param),
        });

        const data = await res.json();

        if (data.status === 200) {
          toast({
            title: "Success",
            description: `You have saved ${foundWordsList.length} words to flashcard`,
          });
          await checkSavedWordlist();
        } else if (data.status === 400) {
          toast({
            title: "Word already saved",
            description: `${data?.message}`,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Something went wrong.",
        description: "Your word was not saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      onCompleteChange(true);
    }
  };

  // Get the current locale
  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";

  useEffect(() => {
    const fetchWordList = async () => {
      try {
        setLoading(true); // Start loading
        const resWordlist = await fetch(`/api/v1/assistant/wordlist`, {
          method: "POST",
          body: JSON.stringify({ article, articleId }),
        });

        const data = await resWordlist.json();

        let wordList = [];

        if (data?.timepoints) {
          wordList = data?.timepoints.map(
            (timepoint: { timeSeconds: number }, index: number) => {
              const startTime = timepoint.timeSeconds;
              const endTime =
                index === data?.timepoints.length - 1
                  ? timepoint.timeSeconds + 10
                  : data?.timepoints[index + 1].timeSeconds;
              return {
                vocabulary: data?.word_list[index]?.vocabulary,
                definition: data?.word_list[index]?.definition,
                index,
                startTime,
                endTime,
                audioUrl: `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/${AUDIO_WORDS_URL}/${articleId}.mp3`,
              };
            }
          );
        } else {
          wordList = data?.word_list;
        }
        setWordList(wordList);
      } catch (error: any) {
        console.error("error: ", error);
        toast({
          title: "Something went wrong.",
          description: `${error?.response?.data?.message || error?.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchWordList();
  }, [article, articleId]);

  const playAudioSegment = (audioUrl: string, start: number, end: number) => {
    const audio = new Audio(audioUrl);
    audio.currentTime = start;

    const onTimeUpdate = () => {
      if (audio.currentTime >= end) {
        audio.pause();
        audio.removeEventListener("timeupdate", onTimeUpdate);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.play();
  };

  const checkSavedWordlist = async () => {
    try {
      const res = await fetch(
        `/api/v1/users/wordlist/${userId}?articleId=${articleId}`
      );
      const data = await res.json();
      setSavedWordlistCount(data.word.length);
    } catch (error) {
      console.error;
    }
  };

  useEffect(() => {
    (async () => {
      await checkSavedWordlist();
    })();
  }, []);

  useEffect(() => {
    if (savedWordlistCount > 5) {
      onCompleteChange(true);
    }
  }, [savedWordlistCount]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase4Title")}</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {loading && wordList ? (
              <div className="flex items-start xl:h-[400px] w-full md:w-[725px] xl:w-[710px] space-x-4 mt-5">
                <div className="space-y-8 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-bold">{t("phase4Description")}</span>
                </div>
                <div className="mt-2 max-h-[400px] w-full md:w-[725px] xl:w-[710px] overflow-auto">
                  <FormField
                    control={form.control}
                    name="items"
                    render={() => {
                      return (
                        <FormItem>
                          <>
                            {wordList?.map((word, index) => (
                              <FormField
                                key={index}
                                control={form.control}
                                name="items"
                                render={({ field }) => {
                                  return (
                                    <FormItem key={word?.vocabulary}>
                                      <FormControl>
                                        <div className="p-4 border-b-2 flex flex-row">
                                          <div>
                                            <Checkbox
                                              checked={field?.value?.includes(
                                                word?.vocabulary
                                              )}
                                              onCheckedChange={(checked) => {
                                                if (
                                                  Array.isArray(field.value)
                                                ) {
                                                  return checked
                                                    ? field.onChange([
                                                        ...field.value,
                                                        word.vocabulary,
                                                      ])
                                                    : field.onChange(
                                                        field.value.filter(
                                                          (value) =>
                                                            value !==
                                                            word.vocabulary
                                                        )
                                                      );
                                                } else {
                                                  return field.onChange(
                                                    checked
                                                      ? [word.vocabulary]
                                                      : []
                                                  );
                                                }
                                              }}
                                            />
                                          </div>

                                          <span className="font-bold text-cyan-500 ml-2">
                                            {word.vocabulary}:{" "}
                                          </span>

                                          <div className="mr-1">
                                            {word?.startTime && (
                                              <AudioImg
                                                key={word.vocabulary}
                                                audioUrl={
                                                  word.audioUrl
                                                    ? word.audioUrl
                                                    : `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/${AUDIO_WORDS_URL}/${articleId}.mp3`
                                                }
                                                startTimestamp={word?.startTime}
                                                endTimestamp={word?.endTime}
                                              />
                                            )}
                                          </div>

                                          <span>
                                            {word.definition[currentLocale]}
                                          </span>
                                        </div>
                                      </FormControl>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {`Saved: ${savedWordlistCount} word`}
                  </div>
                  <Button className="w-full lg:w-1/4" type="submit">
                    {t("saveButton")}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

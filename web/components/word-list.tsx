"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useScopedI18n } from "@/locales/client";
import { Book } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useCurrentLocale } from "@/locales/client";
import { Article } from "@/components/models/article-model";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "./ui/use-toast";
interface Props {
  article: Article;
  articleId: string;
  userId: string;
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
}

export default function WordList({ article, articleId, userId }: Props) {
  const t = useScopedI18n("components.wordList");
  const [loading, setLoading] = useState<boolean>(false);
  const [wordList, setWordList] = useState<WordList[]>([]);

  // Get the current locale
  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";
  const handleWordList = useCallback(async () => {
    try {
      setLoading(true); // Start loading
      const resWordlist = await axios.post(`/api/assistant/wordlist`, {
        article,
        articleId,
        userId,
      });

      setWordList(resWordlist?.data?.word_list);
    } catch (error: any) {
      toast({
        title: "Something went wrong.",
        description: `${error?.response?.data?.message || error?.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  }, [article, articleId, userId]);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={handleWordList} className="mb-4 ml-3">
            {t("title")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px] h-96">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <Book />
                <div className="ml-2">{t("title")}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center space-x-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            <div className=" overflow-auto">
              <span className="font-bold">{t("detail")}</span>
              {wordList?.map((word, index) => (
                <div key={index} className="p-4 border-b-2">
                  <Checkbox id={`${word.vocabulary}`} />
                  <span className="font-bold text-cyan-500 ml-2">
                    {word.vocabulary}:{" "}
                  </span>
                  <span>{word.definition[currentLocale]}</span>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <div>
                <Button type="button" variant="secondary">{t("closeButton")}</Button>
                <Button className="ml-2" onClick={()=> {alert("sss")}}>
                  {t("saveButton")}
                </Button>
              </div>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

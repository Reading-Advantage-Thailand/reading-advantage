"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useScopedI18n } from "@/locales/client";
import { Book } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useCurrentLocale } from "@/locales/client";
import { Article } from "@/components/models/article-model";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [wordList, setWordList] = useState<any[]>([]);//useState<WordList[]>([]);

  // Get the current locale
  const currentLocale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";

  const handleWordList = useCallback(async () => {
    console.log("article :", article);
    try {
      setLoading(true); // Start loading
      const resWordlist = await axios.post(`/api/assistant/wordlist`, {
        article,
        articleId,
        userId,
      });
      console.log("resWordlist :", resWordlist?.data?.wordList);
      setWordList(resWordlist?.data?.wordList);
    } catch (error: any) {     
      console.log(error); 
       toast({
         title: "Something went wrong.",
         description: `${error?.response?.data?.message || error?.message}`,
         variant: "destructive",
       });      
    } finally {
      setLoading(false); // Stop loading
    }
  }, [article, articleId, userId]);

  const wordSample = [
    {
      vocabulary: "variety",
      definition: {
        en: "A number of different types of things.",
        th: "ความหลากหลาย",
        cn: "多样",
        tw: "多樣",
        vi: "sự đa dạng",
      },
    },
    {
      vocabulary: "purposes",
      definition: {
        en: "The reasons for which something is done.",
        th: "วัตถุประสงค์",
        cn: "目的",
        tw: "目的",
        vi: "mục đích",
      },
    },
    // ... up to ten entries
  ];

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={handleWordList} className="mb-4 ml-3">
            {t("title")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <Book />
                <div className="ml-2">{t("title")}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {loading && (
            <div className="flex items-center space-x-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          )}
          {/* {wordList?.map((word, index) => (
            <div key={index} className="pb-4 border-b-2">
              <span className="font-bold text-cyan-500">
                {word.vocabulary}:{" "}
              </span>
              <span>{word.definition[currentLocale]}</span>
            </div>
          ))} */}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

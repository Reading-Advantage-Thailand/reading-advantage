"use client";
import React from "react";
import Tokenizer from "sentence-tokenizer";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { toast } from "./ui/use-toast";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "./ui/badge";
import { Icons } from "./icons";
import { useCurrentLocale, useScopedI18n } from "@/locales/client";
import { ArticleType } from "@/types";
import { Button } from "./ui/button";
import { set } from "lodash";
import { Separator } from "./ui/separator";
import { Dialog } from "@mui/material";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DialogPortal } from "@radix-ui/react-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { getCurrentLocale } from "@/locales/server";

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

interface ITextAudio {
  text: string;
  begin?: number;
}

type Props = {
  article: ArticleType;
  className?: string;
  articleId: string;
  userId: string;
};
export default function ArticleContent({
  article,
  articleId,
  userId,
  className,
}: Props) {
  const t = useScopedI18n("components.articleContent");
  //const [rating, setRating] = React.useState<number>(-1);
  const [text, setText] = React.useState<ITextAudio[]>([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = React.useState(-1);
  const [isplaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const textContainer = React.useRef<HTMLParagraphElement | null>(null);
  const [isSplit, setIsSplit] = React.useState(false);
  const [selectedSentence, setSelectedSentence] = React.useState<Number>(-1);
  const [loading, setLoading] = React.useState(false);
  const [translate, setTranslate] = React.useState<string[]>([]);
  const [isTranslate, setIsTranslate] = React.useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isSplit) {
      splitToText(article);
      setIsSplit(true);
    }
  }, [article, isSplit]);

  const handleHighlight = (audioCurrentTime: number) => {
    const lastIndex = text.length - 1;

    if (audioCurrentTime >= text[lastIndex].begin!) {
      setHighlightedWordIndex(lastIndex);
    } else {
      const index = text.findIndex((word) => word.begin! >= audioCurrentTime);
      setHighlightedWordIndex(index - 1);
    }

    if (textContainer.current && highlightedWordIndex !== -1) {
      const highlightedWordElement = textContainer.current.children[
        highlightedWordIndex
      ] as HTMLElement;
      if (highlightedWordElement) {
        highlightedWordElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(!isplaying);
    if (audioRef.current === null) return;
    if (isplaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const splitToText = (article: ArticleType) => {
    /*
        {
    "subGenre": "The Grimm Brothers",
    "cefrScores": {
        "A1": 0.20283226668834686,
        "B2": 0.00017777649918571115,
        "A2": 0.793014407157898,
        "C1": 0.0001771106180967763,
        "B1": 0.003724394366145134,
        "C2": 0.00007401969924103469
    },
    "cefrLevel": "A2",
    "grade": 1,
    "genre": "Tales and Myths",
    "ari": 7.462619047619047,
    "topic": "The Elves and the Shoemaker",
    "title": "The Elves and the Shoemaker",
    "type": "Fiction",
    "content": "Once upon a time, there was a shoemaker who worked very hard. He made the best shoes in the town. But he was very poor and had no money. One day, he had only enough leather to make one pair of shoes. He cut the leather and left it on his table. The next morning, he found a beautiful pair of shoes on his table. They were perfect! The shoemaker was amazed. He sold the shoes and earned a lot of money. With the money, he bought more leather. Again, he cut the leather and left it on his table. The next morning, he found another pair of shoes on his table. They were even more beautiful than the first pair. This happened every night. The shoemaker became rich and famous. One night, he decided to find out who was making the shoes. He hid behind a curtain and waited. At midnight, he saw two little elves. They were making the shoes! The shoemaker thanked the elves for their help. From that day on, the shoemaker and the elves became good friends.",
    "raLevel": 20,
    "timepoints": [
        {
            "timeSeconds": 0.36040371656417847,
            "markName": "sentence1"
        },
        {
            "timeSeconds": 4.767460346221924,
            "markName": "sentence2"
        },
        {
            "timeSeconds": 7.213415622711182,
            "markName": "sentence3"
        },
        {
            "timeSeconds": 10.031344413757324,
            "markName": "sentence4"
        },
        {
            "timeSeconds": 14.523951530456543,
            "markName": "sentence5"
        },
        {
            "timeSeconds": 17.5306339263916,
            "markName": "sentence6"
        },
        {
            "timeSeconds": 21.950830459594727,
            "markName": "sentence7"
        },
        {
            "timeSeconds": 23.57438087463379,
            "markName": "sentence8"
        },
        {
            "timeSeconds": 25.544336318969727,
            "markName": "sentence9"
        },
        {
            "timeSeconds": 28.47727394104004,
            "markName": "sentence10"
        },
        {
            "timeSeconds": 31.025312423706055,
            "markName": "sentence11"
        },
        {
            "timeSeconds": 35.10248565673828,
            "markName": "sentence12"
        },
        {
            "timeSeconds": 39.48305130004883,
            "markName": "sentence13"
        },
        {
            "timeSeconds": 42.35913848876953,
            "markName": "sentence14"
        },
        {
            "timeSeconds": 44.20032501220703,
            "markName": "sentence15"
        },
        {
            "timeSeconds": 46.99827194213867,
            "markName": "sentence16"
        },
        {
            "timeSeconds": 51.2790641784668,
            "markName": "sentence17"
        },
        {
            "timeSeconds": 53.85567855834961,
            "markName": "sentence18"
        },
        {
            "timeSeconds": 56.79862594604492,
            "markName": "sentence19"
        },
        {
            "timeSeconds": 58.840389251708984,
            "markName": "sentence20"
        },
        {
            "timeSeconds": 61.91453170776367,
            "markName": "sentence21"
        }
    ],
    "questions": {
        "mcqs": [
            {
                "descriptor_id": "19.YL.17",
                "question": "What did the shoemaker make in his shop?",
                "answers": [
                    "Shoes",
                    "Pants",
                    "Hats",
                    "Jackets"
                ]
            },
            {
                "descriptor_id": "19.YL.17",
                "question": "Why was the shoemaker poor?",
                "answers": [
                    "He didn't like making shoes",
                    "He didn't work hard",
                    "He had no money",
                    "He didn't have any shoes"
                ]
            },
            {
                "descriptor_id": "19.W.12",
                "question": "How did the shoemaker feel when he found the pair of shoes made by the elves?",
                "answers": [
                    "Angry",
                    "Amazed",
                    "Sad",
                    "Happy"
                ]
            },
            {
                "descriptor_id": "20.YL.21",
                "question": "What happened every night in the shoemaker's shop?",
                "answers": [
                    "The shoemaker fell asleep",
                    "The shop became crowded",
                    "The elves came to play",
                    "A pair of shoes appeared on the table"
                ]
            }
        ],
        "shortAnswer": {
            "question": "Describe what the shoemaker did when he found out that the elves were making the shoes.",
            "suggestedAnswer": "The shoemaker thanked the elves for their help and became good friends with them."
        }
    }
}
        
        */
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(article.content);
    const result = tokenizer.getSentences();
    console.log("splitToText article : ", article);
    console.log("splitToText result : ", result);
    console.log("splitToText tokenizer : ", tokenizer);
    // Clear the existing content in the 'text' array
    setText([]);

    for (let i = 0; i < article.timepoints.length; i++) {
      setText((prev) => [
        ...prev,
        { text: result[i], begin: article.timepoints[i].timeSeconds },
      ]);
    }
  };

  const handleSkipToSentence = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const saveToFlashcard = async () => {
    //translate before save
    if (!isTranslate) {
      await handleTranslateSentence();
    } else {
      try {
        let endTimepoint = 0;
        if (selectedSentence !== text.length - 1) {
          endTimepoint = text[(selectedSentence as number) + 1].begin as number;
        } else {
          endTimepoint = audioRef.current?.duration as number;
        }
        console.log("translate", translate[selectedSentence as number]);
        const res = await axios.post(`/api/users/${userId}/sentences`, {
          sentence: text[selectedSentence as number].text,
          sn: selectedSentence,
          articleId: articleId,
          translation: {
            th: translate[selectedSentence as number],
          },
          timepoint: text[selectedSentence as number].begin,
          endTimepoint: endTimepoint,
        });
        console.log("res", res);
        toast({
          title: "Success",
          description: `You have saved "${
            text[selectedSentence as number].text
          }" to flashcard`,
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

  console.log("text: ", text);

  async function handleTranslateSentence() {
    setLoading(true);
    try {
      const sentences = text.map((sentence) => sentence.text);
      // get language from local
      if (!locale || locale === "en") {
        return;
      }
      const res = await getTranslate(sentences, articleId, locale);
      console.log("handleTranslateSentence res", res);
      /*
            articleId,
            translation : [
                "กาลครั้งหนึ่งมีช่างทำรองเท้าคนหนึ่งทำงานหนักมาก",
                "เขาทำรองเท้าที่ดีที่สุดในเมือง",
                "แต่เขายากจนมากและไม่มีเงิน",
                "วันหนึ่งเขามีหนังเพียงพอที่จะทำรองเท้าคู่เดียว",
                "เขาตัดหนังแล้วทิ้งมันไว้บนโต๊ะ",
                "เช้าวันรุ่งขึ้น เขาพบรองเท้าคู่สวยคู่หนึ่งอยู่บนโต๊ะ",
                "พวกเขาสมบูรณ์แบบ!",
                "ช่างทำรองเท้ารู้สึกประหลาดใจ",
                "เขาขายรองเท้าและได้รับเงินมากมาย",
                "ด้วยเงินที่เขาซื้อหนังเพิ่ม",
                "เขาตัดหนังอีกครั้งและทิ้งมันไว้บนโต๊ะ",
                "เช้าวันรุ่งขึ้น เขาพบรองเท้าอีกคู่หนึ่งอยู่บนโต๊ะของเขา",
                "พวกเขาสวยกว่าคู่แรกด้วยซ้ำ",
                "สิ่งนี้เกิดขึ้นทุกคืน",
                "ช่างทำรองเท้าเริ่มร่ำรวยและมีชื่อเสียง",
                "คืนหนึ่ง เขาตัดสินใจค้นหาว่าใครเป็นคนทำรองเท้าคู่นี้",
                "เขาซ่อนตัวอยู่หลังม่านและรอ",
                "ในเวลาเที่ยงคืน เขาเห็นเอลฟ์ตัวน้อยสองตัว",
                "พวกเขากำลังทำรองเท้า!",
                "ช่างทำรองเท้าขอบคุณพวกเอลฟ์ที่ช่วยเหลือ",
                "ตั้งแต่วันนั้นเป็นต้นมา ช่างทำรองเท้าและเอลฟ์ก็กลายเป็นเพื่อนที่ดีต่อกัน"
            ]
          */

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
        // toast({
        //     title: "Success",
        //     description: "Your sentence was translated.",
        // });
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
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <p>{t("voiceAssistant")}</p>
          <Button size="sm" variant="secondary" onClick={handlePause}>
            {isplaying ? (
              <Icons.pause className="mr-1" size={12} />
            ) : (
              <Icons.play className="mr-1" size={12} />
            )}
            {isplaying ? t("soundButton.pause") : t("soundButton.play")}
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
              ? "ปิดหน้าต่างการแปล"
              : "แปลเป็นภาษาไทย"}
          </Button>
        )}
      </div>
      {console.log("translate : ", translate)}
      {/* show ที่แปลภาษาทีละประโยค */}
      {isTranslate && isTranslateOpen && (
        <div className="h-32 md:h-24 flex flex-col justify-between items-center">
          <Separator />
          {!isplaying && highlightedWordIndex === -1 ? (
            <p className="text-center text-green-500">
              Your translate sentence will be here
            </p>
          ) : (
            <p className="text-center text-green-500">
              {translate[highlightedWordIndex]}
            </p>
          )}
          <Separator />
        </div>
      )}
      <ContextMenu>
        <ContextMenuTrigger>
          {/* show content ที่เป็น eng และ hightlight ตามคำพูด */}
          {text.map((sentence, index) => (
            <p
              key={index}
              className={cn(
                "inline text-muted-foreground hover:bg-blue-200 dark:hover:bg-blue-600 select-none cursor-pointer",
                highlightedWordIndex === index
                  ? "bg-yellow-50"
                  : "bg-transparent"
              )}
              onMouseEnter={() => {
                setSelectedSentence(index);
                setSelectedIndex(index);
              }}
              onClick={() => handleSkipToSentence(sentence.begin ?? 0)}
            >
              {sentence.text}{" "}
            </p>
          ))}
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
                  ? text[selectedSentence as number].text
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
      <audio
        ref={audioRef}
        onTimeUpdate={() =>
          handleHighlight(audioRef.current ? audioRef.current.currentTime : 0)
        }
      >
        <source
          src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/audios/${articleId}.mp3`}
        />
      </audio>
    </>
  );
}

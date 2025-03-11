"use client";

import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface Chapter {
  title: string;
  summary: string;
}

interface ChapterListProps {
  locale: string;
  storyId: string;
  chapters: Chapter[];
}

export default function ChapterList({ locale, storyId, chapters }: ChapterListProps) {
  const router = useRouter();

  const handleChapterClick = (chapterNumber: number) => {
    router.push(`/${locale}/student/stories/${storyId}/${chapterNumber}`);
  };

  return (
    <ScrollArea className="h-full p-2">
      {chapters.map((chapter, index) => (
        <div key={index} className="mb-4">
          <p className="font-semibold">{chapter.title}</p>
          <p className="text-gray-500">{chapter.summary}</p>
          <Button
            className="mt-2"
            variant="outline"
            onClick={() => handleChapterClick(index + 1)}
          >
            Read Chapter {index + 1}
          </Button>
          <Separator className="my-2" />
        </div>
      ))}
    </ScrollArea>
  );
}

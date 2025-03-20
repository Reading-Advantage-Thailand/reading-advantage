"use client";

import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface Chapter {
  title: string;
  summary: string;
  is_read: boolean;
}

interface ChapterListProps {
  locale: string;
  storyId: string;
  chapters: Chapter[];
}

export default function ChapterList({
  locale,
  storyId,
  chapters,
}: ChapterListProps) {
  const router = useRouter();

  const handleChapterClick = (chapterNumber: number) => {
    router.push(`/${locale}/student/stories/${storyId}/${chapterNumber}`);
  };

  return (
    <ScrollArea className="h-full p-2">
      {chapters.map((chapter, index) => (
        <div key={index} className="mb-4">
          <p className="font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {chapter.title}
            {chapter.is_read && (
              <span className="text-green-500">
                <span className="text-gray-500">
                  <span className="text-green-500">Previously Read</span>
                </span>
              </span>
            )}
          </p>
          <p className="text-gray-500">{chapter.summary}</p>
          {chapter.is_read ? (
            <div className="flex justify-end items-end">
              <Button
                className="mt-2 justify-end items-end"
                variant="outline"
                onClick={() => handleChapterClick(index + 1)}
              >
                Continue Read Chapter {index + 1}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end items-end">
              <Button
                className="mt-2 ml-auto"
                variant="outline"
                onClick={() => handleChapterClick(index + 1)}
              >
                Read Chapter {index + 1}
              </Button>
            </div>
          )}
          <Separator className="my-2" />
        </div>
      ))}
    </ScrollArea>
  );
}

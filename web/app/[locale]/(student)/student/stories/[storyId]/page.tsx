import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import ChapterList from "@/components/story-chapter-list";

async function getStory(storyId: string) {
  const data = await fetchData(`/api/v1/stories/${storyId}`);
  return data.result;
}

export default async function StoryChapterSelectionPage({
  params,
}: {
  params: { locale: string; storyId: string };
}) {
  const t = await getScopedI18n("pages.student.storyPage.story");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

  const storyResponse = await getStory(params.storyId);

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {storyResponse.title}
          </CardTitle>
          <p className="text-gray-500">
            {storyResponse.genre} - {storyResponse.subgenre}
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full h-auto aspect-[16/9] overflow-hidden">
            <Image
              src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${storyResponse.id}.png`}
              alt="Story Image"
              width={640}
              height={640}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <Tabs defaultValue="summary" className="w-full mt-4">
            <TabsList className="flex justify-start space-x-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <ScrollArea className="h-40 p-2">
                <p>{storyResponse.storyBible.summary}</p>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="characters">
              <ScrollArea className="h-40 p-2">
                {storyResponse.storyBible.characters.map(
                  (char: any, index: number) => (
                    <div key={index} className="mb-4">
                      <p className="font-semibold">{char.name}</p>
                      <p className="text-gray-500">{char.description}</p>
                      <Separator className="my-2" />
                    </div>
                  )
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chapters">
              <ChapterList
                locale={params.locale}
                storyId={storyResponse.id}
                chapters={storyResponse.chapters}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

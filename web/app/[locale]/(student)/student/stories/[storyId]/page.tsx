import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";
import { getScopedI18n } from "@/locales/server";
import { fetchData } from "@/utils/fetch-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import ChapterList from "@/components/stories-chapter-list";
import StoriesAssignDialog from "@/components/teacher/stories-assign-dialog";
import StoriesActions from "@/components/stories-actions";
import { CardDescription } from "@/components/ui/card";
import { StoriesSummary } from "@/components/stories-summary";

export interface StoryBible {
  mainPlot: {
    premise: string;
    exposition: string;
    risingAction: string;
    climax: string;
    fallingAction: string;
    resolution: string;
  };
  characters: Character[];
  setting: Setting;
  themes: Theme[];
  summary: string;
  "image-description": string;
}

interface Character {
  name: string;
  description: string;
  background: string;
  speechPatterns: string;
  arc: {
    startingState: string;
    development: string;
    endState: string;
  };
  relationships: Relationship[];
}

interface Relationship {
  withCharacter: string;
  nature: string;
  evolution: string;
}

interface Setting {
  time: string;
  places: Place[];
  worldRules: string[];
}

interface Place {
  name: string;
  description: string;
  significance: string;
}

interface Theme {
  theme: string;
  development: string;
}

async function getStory(storyId: string) {
  const data = await fetchData(`/api/v1/stories/${storyId}`);
  return data.result;
}

export default async function StoryChapterSelectionPage({
  params,
}: {
  params: { locale: string; storyId: string };
}) {
  const t = await getScopedI18n("components.articleCard");
  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

  const translations = {
    chapters: t("chapters"),
    characters: t("characters"),
    previouslyRead: t("previouslyRead"),
    continueRead: t("continueRead"),
    readChapter: t("readChapter"),
  };

  const storyResponse = await getStory(params.storyId);

  return (
    <div className="md:flex md:flex-row md:gap-3 md:mb-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {storyResponse.title}
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <Badge>
              {t("raLevel", {
                raLevel: storyResponse.ra_level,
              })}
            </Badge>
            <Badge>
              {t("cefrLevel", {
                cefrLevel: storyResponse.cefr_level,
              })}
            </Badge>
            <CardDescription>
              <StoriesSummary
                story={storyResponse}
                storyId={storyResponse.id}
              />
            </CardDescription>
          </div>
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
          <Tabs defaultValue="chapters" className="w-full mt-4">
            <TabsList className="flex justify-start space-x-2">
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
            </TabsList>

            <TabsContent value="chapters">
              <ChapterList
                locale={params.locale}
                storyId={storyResponse.id}
                chapters={storyResponse.chapters}
                translations={translations}
              />
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
          </Tabs>
        </CardContent>
      </Card>

      {user.role.includes("teacher") && (
        <StoriesAssignDialog
          story={storyResponse}
          storyId={params.storyId}
          userId={user.id}
        />
      )}

      {user.role.includes("system") && (
        <div className="flex gap-4">
          <StoriesActions story={storyResponse} storyId={params.storyId} />
        </div>
      )}
    </div>
  );
}

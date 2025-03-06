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

interface Story {
  id: string;
  title: string;
  average_rating: number;
  genre: string;
  subgenre: string;
  type: string;
  ra_level: number;
  cefr_level: string;
  storyBible: StoryBible;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  chapters: Chapter[];
}

interface Chapter {
  title: string;
  content: string;
  summary: string;
  "image-description": string;
  analysis: {
    wordCount: number;
    averageSentenceLength: number;
    vocabulary: {
      uniqueWords: number;
      complexWords: number;
      targetWordsUsed: string[];
    };
    grammarStructures: string[];
    readabilityScore: number;
  };
  continuityData: {
    events: string[];
    characterStates: CharacterState[];
    introducedElements: string[];
  };
  questions: Question[];
}

interface CharacterState {
  character: string;
  currentState: string;
  location: string;
}

interface Question {
  type: "MCQ" | "SAQ" | "LAQ";
  question: string;
  options?: string[];
  answer: string;
}

interface StoryBible {
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

interface StoryResponse {
  result: Story;
  selectionGenres: string[];
}

export const metadata = {
  title: "Story",
  description: "Story",
};

async function getArticle(storyId: string): Promise<Story> {
  const data: StoryResponse = await fetchData(
    `/api/v1/stories?storyId=${storyId}`
  );
  return data.result;
}

export default async function StoryChapterSelectionPage({
  params,
}: {
  params: { storyId: string };
}) {
  const t = await getScopedI18n("pages.student.storyPage.story");

  const user = await getCurrentUser();
  if (!user) return redirect("/auth/signin");

  const storyResponse = await getArticle(params.storyId);

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
                {storyResponse.storyBible.characters.map((char, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold">{char.name}</p>
                    <p className="text-gray-500">{char.description}</p>
                    <Separator className="my-2" />
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chapters">
              <ScrollArea className="h-full p-2">
                {storyResponse.chapters.map((chapter, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold">{chapter.title}</p>
                    <p className="text-gray-500">{chapter.summary}</p>
                    <Separator className="my-2" />
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

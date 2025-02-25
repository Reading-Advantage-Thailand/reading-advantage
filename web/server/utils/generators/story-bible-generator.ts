export async function generateStoryBible({
  topic,
  genre,
  subgenre,
}: {
  topic: string;
  genre: string;
  subgenre: string;
}) {
  return {
    mainPlot: {
      premise: `A unique story about ${topic}`,
      exposition: `Introduction to a ${genre} world with ${subgenre} elements.`,
      risingAction: `Challenges that arise related to ${topic}.`,
      climax: `The peak moment of tension in ${topic}.`,
      fallingAction: `Resolution starts unfolding.`,
      resolution: `Final closure of the story.`,
    },
    characters: [
      {
        name: "Protagonist",
        description: "Main character of the story",
        background: "Their past and motivations.",
      },
    ],
    setting: {
      time: "Future",
      places: [
        { name: "Main Location", description: "Detailed world-building" },
      ],
      worldRules: ["Magic exists", "Technology is advanced"],
    },
    themes: [
      { theme: "Courage", development: "Character overcomes struggles" },
    ],
    summary: `A ${genre} story about ${topic}.`,
  };
}

import { z } from "zod";

const CEFRLevelRequirementsSchema = z.object({
  wordCount: z.object({
    fiction: z.number(),
    nonfiction: z.number(),
  }),
  sentenceStructure: z.object({
    averageWords: z.string(),
    complexity: z.string(),
    allowedStructures: z.array(z.string()),
  }),
  vocabulary: z.object({
    level: z.string(),
    restrictions: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  grammar: z.object({
    allowedTenses: z.array(z.string()),
    allowedStructures: z.array(z.string()),
    restrictions: z.array(z.string()),
  }),
  content: z.object({
    plotComplexity: z.string(),
    characterDepth: z.string(),
    themes: z.string(),
    culturalReferences: z.string(),
  }),
  style: z.object({
    tone: z.string(),
    literaryDevices: z.array(z.string()),
    narrativeApproach: z.string(),
  }),
  structure: z.object({
    paragraphLength: z.string(),
    textOrganization: z.string(),
    transitionComplexity: z.string(),
  }),
});

export const CEFRRequirements: Record<
  string,
  z.infer<typeof CEFRLevelRequirementsSchema>
> = {
  A1: {
    wordCount: { fiction: 250, nonfiction: 250 },
    sentenceStructure: {
      averageWords: "4-5 words",
      complexity: "Very simple",
      allowedStructures: ["Subject + Verb", "Subject + Verb + Object"],
    },
    vocabulary: {
      level: "Basic / Beginner",
      restrictions: ["Only most common everyday words"],
      suggestions: ["Basic nouns", "Common verbs", "Simple adjectives"],
    },
    grammar: {
      allowedTenses: ["Simple Present", "Present Continuous"],
      allowedStructures: ["Basic word order (SVO)"],
      restrictions: ["No passive voice", "No conditionals"],
    },
    content: {
      plotComplexity: "Very simple and linear",
      characterDepth: "Basic descriptions only",
      themes: "Everyday situations with simple moral lessons",
      culturalReferences: "Minimal, globally understandable references",
    },
    style: {
      tone: "Simple and direct",
      literaryDevices: ["Basic repetition", "Simple descriptions"],
      narrativeApproach: "Straightforward, chronological order",
    },
    structure: {
      paragraphLength: "2-3 short sentences",
      textOrganization: "Simple chronological order",
      transitionComplexity: "Basic time markers only",
    },
  },
  A2: {
    wordCount: { fiction: 400, nonfiction: 400 },
    sentenceStructure: {
      averageWords: "6-7 words",
      complexity: "Simple with some compound sentences",
      allowedStructures: ["Simple sentences", "Basic compound sentences"],
    },
    vocabulary: {
      level: "Elementary",
      restrictions: ["Limited idiomatic expressions"],
      suggestions: ["Common vocabulary sets", "Basic descriptive adjectives"],
    },
    grammar: {
      allowedTenses: ["Simple Present", "Present Continuous", "Simple Past"],
      allowedStructures: ["Compound sentences with common conjunctions"],
      restrictions: ["No complex conditionals", "Limited passive voice"],
    },
    content: {
      plotComplexity: "Simple with clear sequence",
      characterDepth: "Basic personality traits and motivations",
      themes: "Familiar situations with some personal experiences",
      culturalReferences: "Simple, well-explained references only",
    },
    style: {
      tone: "Clear and friendly",
      literaryDevices: ["Simple similes", "Basic descriptions"],
      narrativeApproach: "Clear chronological order with some flashbacks",
    },
    structure: {
      paragraphLength: "3-4 sentences",
      textOrganization: "Clear beginning, middle, and end",
      transitionComplexity: "Basic sequential markers",
    },
  },
  B1: {
    wordCount: { fiction: 600, nonfiction: 600 },
    sentenceStructure: {
      averageWords: "8-10 words",
      complexity: "Mix of simple and compound sentences",
      allowedStructures: ["Complex sentences with common subordinate clauses"],
    },
    vocabulary: {
      level: "Intermediate",
      restrictions: ["Common idiomatic expressions only"],
      suggestions: ["Topic-specific vocabulary", "Common collocations"],
    },
    grammar: {
      allowedTenses: ["All present forms", "All past forms"],
      allowedStructures: ["First and second conditionals", "Passive voice"],
      restrictions: ["Limited perfect continuous forms"],
    },
    content: {
      plotComplexity: "Moderate complexity with subplots",
      characterDepth: "Developed personalities and relationships",
      themes: "Personal and social themes",
      culturalReferences: "Common cultural references with context",
    },
    style: {
      tone: "Natural and conversational",
      literaryDevices: ["Metaphors", "Similes", "Basic symbolism"],
      narrativeApproach: "Mixed chronology with clear markers",
    },
    structure: {
      paragraphLength: "4-6 sentences",
      textOrganization: "Clear structure with some complexity",
      transitionComplexity: "Various transition words and phrases",
    },
  },
  B2: {
    wordCount: { fiction: 1000, nonfiction: 1000 },
    sentenceStructure: {
      averageWords: "10-12 words",
      complexity: "Varied sentence structures",
      allowedStructures: ["Complex sentences", "Varied clause structures"],
    },
    vocabulary: {
      level: "Upper Intermediate",
      restrictions: ["Most idiomatic expressions"],
      suggestions: ["Field-specific terminology", "Nuanced word choices"],
    },
    grammar: {
      allowedTenses: ["All tenses", "Perfect forms", "Continuous forms"],
      allowedStructures: ["All conditionals", "Complex passive constructions"],
      restrictions: ["Very complex or obscure constructions"],
    },
    content: {
      plotComplexity: "Complex plots with multiple threads",
      characterDepth: "Well-developed characters with clear arcs",
      themes: "Abstract and concrete themes",
      culturalReferences: "Varied cultural references with some explanation",
    },
    style: {
      tone: "Sophisticated and nuanced",
      literaryDevices: ["Extended metaphors", "Symbolism", "Irony"],
      narrativeApproach: "Flexible chronology and perspective",
    },
    structure: {
      paragraphLength: "Varied lengths",
      textOrganization: "Complex but clear structure",
      transitionComplexity: "Sophisticated transitions",
    },
  },
  C1: {
    wordCount: { fiction: 1200, nonfiction: 1200 },
    sentenceStructure: {
      averageWords: "15-17 words",
      complexity: "Complex and sophisticated",
      allowedStructures: ["All sentence types", "Multiple subordinate clauses"],
    },
    vocabulary: {
      level: "Advanced",
      restrictions: ["Very rare words"],
      suggestions: ["Sophisticated vocabulary", "Specialized terminology"],
    },
    grammar: {
      allowedTenses: ["Full range of tenses and aspects"],
      allowedStructures: ["All grammatical structures"],
      restrictions: ["Overly archaic constructions"],
    },
    content: {
      plotComplexity: "Sophisticated plots with multiple layers",
      characterDepth: "Complex psychological portrayals",
      themes: "Abstract and philosophical ideas",
      culturalReferences: "Historical, literary, and cultural allusions",
    },
    style: {
      tone: "Nuanced and sophisticated",
      literaryDevices: [
        "Full range of literary devices",
        "Complex narrative techniques",
      ],
      narrativeApproach: "Flexible storytelling with shifts in perspective",
    },
    structure: {
      paragraphLength: "Varied for effect",
      textOrganization: "Sophisticated organization",
      transitionComplexity: "Complex transitions and connections",
    },
  },
  C2: {
    wordCount: { fiction: 1500, nonfiction: 1500 },
    sentenceStructure: {
      averageWords: "18-20 words",
      complexity: "Highly sophisticated",
      allowedStructures: ["Full range of structures", "Literary innovations"],
    },
    vocabulary: {
      level: "Proficient / Native-like",
      restrictions: ["Maintain clarity despite complexity"],
      suggestions: ["Full native-like range", "Creative and innovative usage"],
    },
    grammar: {
      allowedTenses: ["Full native-like range"],
      allowedStructures: ["All possible structures", "Stylistic variations"],
      restrictions: ["Maintain clarity and purpose"],
    },
    content: {
      plotComplexity: "Highly complex and innovative",
      characterDepth: "Sophisticated psychological depth",
      themes: "Philosophical, existential, and literary themes",
      culturalReferences: "Extensive literary and historical references",
    },
    style: {
      tone: "Highly sophisticated",
      literaryDevices: ["Full creative range", "Innovative techniques"],
      narrativeApproach: "Experimental and non-linear storytelling",
    },
    structure: {
      paragraphLength: "Fully flexible",
      textOrganization: "Creative and innovative",
      transitionComplexity: "Sophisticated and creative transitions",
    },
  },
};

export function getCEFRRequirements(level: keyof typeof CEFRRequirements) {
  const requirements = CEFRRequirements[level];
  if (!requirements) {
    throw new Error(`Invalid CEFR level: ${level}`);
  }

  try {
    CEFRLevelRequirementsSchema.parse(requirements);
    return requirements;
  } catch (error) {
    console.error("CEFR data validation failed:", error);
    throw new Error("Invalid CEFR data structure");
  }
}

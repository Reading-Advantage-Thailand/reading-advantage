import OpenAI from "openai";
import { Article } from "../types";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Multiple_choice_question {
    question_number: number;
    question: string;
    correct_answer: string;
    distractor_1: string;
    distractor_2: string;
    distractor_3: string;
}

export async function MC_generator(
    level: string,
    passage: string,
    type: string,
) {

    const MC_propmts: any = {
        "A1": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Style:** Questions should be very straightforward, focusing on basic factual details and literal comprehension of the story. Avoid any abstract or inferred meanings.
2. **Vocabulary and Grammar:** Use very simple language and basic sentence structures. Ensure the vocabulary and grammar used in the questions and answers are accessible to beginners.
3. **Content Focus:** Base questions on concrete and easily identifiable elements of the story, such as main characters, basic settings (e.g., a house, a park), and key events.
4. **Answers:** Provide three to four simple answer options, making sure that the correct answer is clearly identifiable and the distractors are obviously incorrect.
5. **Engagement:** Encourage engagement with the story by asking about straightforward details that can be directly recalled from the text.

Create questions that help A1 level learners to focus on and recall the most basic and clear-cut details of the story.

Output as JSON following this example:
{
  "question_number": represents the number of the question,
  "question": the question text,
  "correct_answer": contains the correct answer to the question,
  "distractor_1": incorrect option or distractor,
  "distractor_2": incorrect option or distractor, 
  "distractor_3": incorrect option or distractor,
}`,
                user: `Devise a set of 10 simple multiple-choice questions based on the provided ${passage}, intended for readers at the A1 level of the Common European Framework of Reference for Languages (CEFR).`,
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Style:** Questions should be very short and straightforward, focusing on basic information and concrete facts presented in the text. Use simple present tense and familiar, everyday language.
2. **Vocabulary and Grammar:** Employ basic vocabulary and simple sentence structures. Avoid complex terms or grammatical constructions.
3. **Content Focus:** Concentrate on clear, factual details from the article, such as names, colors, simple actions, and basic descriptions. Questions might address basic "who," "what," "where," and "when" details.
4. **Answers:** Provide three to four answer choices, ensuring that they are clearly distinct from each other, with only one correct answer. Use simple words and phrases, and keep the structure of each option consistent.
5. **Engagement:** Ensure the questions are directly related to the content of the article and are written in an engaging manner that encourages the reader to recall specific details from the text.

Create questions that help assess the reader's understanding of the text in a way that is appropriate and accessible for A1 level learners.

Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "correct_answer": contains the correct answer to the question,
    "distractor_1": incorrect option or distractor,
    "distractor_2": incorrect option or distractor, 
    "distractor_3": incorrect option or distractor,
}`,
                user: `Develop a set of 10 simple multiple-choice questions based on the provided ${passage}, tailored for readers at the A1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "A2": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Style:** Questions should focus on straightforward comprehension of the story, including main events, basic character descriptions, and common settings. Incorporate questions that require simple inferences or conclusions based on the text.
2. **Vocabulary and Grammar:** Use clear, everyday language, slightly expanding the range of vocabulary and sentence structures compared to A1. Include basic past and future tenses where relevant.
3. **Content Focus:** Questions can be about main events in the story, key characteristics of main characters, and simple motivations or feelings, as long as they are clearly presented in the story.
4. **Answers:** Provide three to four answer choices, with one clear correct answer. Distractors should be simple but plausible, avoiding overly complex or abstract options.
5. **Engagement:** Encourage readers to think a little beyond the most basic plot points, but keep the focus on direct comprehension and simple deductions.

Construct questions that help A2 level learners to practice understanding of simple storylines, character motivations, and settings, while beginning to develop inferential thinking skills.

Output as JSON following this example:
{
  "question_number": represents the number of the question,
  "question": the question text,
  "correct_answer": contains the correct answer to the question,
  "distractor_1": incorrect option or distractor,
  "distractor_2": incorrect option or distractor, 
  "distractor_3": incorrect option or distractor,
}`,
                user: `Formulate a series of 10 simple, yet slightly more detailed, multiple-choice questions based on the specified ${passage}, appropriate for readers at the A2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Style:** Formulate questions that are simple yet slightly more complex than at A1. Questions can include basic inferences or conclusions based on the text, along with factual details.
2. **Vocabulary and Grammar:** Use a wider range of vocabulary compared to A1, including common everyday expressions and phrases. Sentence structures can be slightly more varied, incorporating both simple and some compound sentences.
3. **Content Focus:** Questions should cover basic information (names, places, main ideas), and simple descriptive content in the article. Include questions that ask about straightforward reasons, purposes, or basic opinions expressed in the text.
4. **Answers:** Provide three to four options for each question, with one correct answer. Ensure that the incorrect options are plausible but clearly distinguishable from the correct answer.
5. **Engagement:** Make sure the questions are engaging and encourage the reader to think back to the key points and details of the article.

Develop questions that not only assess the direct recall of facts from the text but also basic comprehension, including simple cause and effect or understanding of motives, suitable for A2 level learners.

Output as JSON following this example:
{
  "question_number": represents the number of the question,
  "question": the question text,
  "correct_answer": contains the correct answer to the question,
  "distractor_1": incorrect option or distractor,
  "distractor_2": incorrect option or distractor, 
  "distractor_3": incorrect option or distractor,
}`,
                user: `Write a set of 10 multiple-choice questions based on the provided ${passage}, specifically designed for readers at the A2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "B1": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Style:** Questions should test understanding of the story at a deeper level, such as motivations of characters, main themes, and the sequence of events. Questions can include why characters behave in certain ways or the implications of their actions.
2. **Vocabulary and Grammar:** Use a broader vocabulary and more complex sentence structures, including different tenses and common idiomatic expressions. Ensure the language remains accessible for intermediate learners.
3. **Content Focus:** Focus on more detailed aspects of the plot, character development, and settings. Include questions that require basic analytical thinking and understanding of the narrative's structure.
4. **Answers:** Provide four answer choices, ensuring one correct answer with subtler distractors that require closer reading or inference to distinguish.
5. **Engagement:** Encourage deeper engagement with the text by asking questions that make the readers think about the story's various layers and underlying messages.

Create questions that help B1 level learners to engage more critically with the story, understanding its deeper meanings and nuances, and recognizing character development and thematic elements.

Output as JSON following this example:
{
  "question_number": represents the number of the question,
  "question": the question text,
  "correct_answer": contains the correct answer to the question,
  "distractor_1": incorrect option or distractor,
  "distractor_2": incorrect option or distractor, 
  "distractor_3": incorrect option or distractor,
}`,
                user: `Develop a set of 10 engaging multiple-choice questions based on the provided ${passage}, suitable for readers at the B1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Style:** Develop questions that are more challenging than A2, focusing on understanding of main ideas, key details, and implied meanings in the text. Questions can also address the writer's perspective or the tone of the article.
2. **Vocabulary and Grammar:** Employ a broader vocabulary including expressions of time, quantity, opinion, and comparison. Questions can be phrased using a mix of simple and complex sentence structures, including some subordination (e.g., because, although).
3. **Content Focus:** Direct questions towards understanding themes, arguments, or specific points of view presented in the article. Include questions that require interpretation of descriptions, reasons behind actions, and understanding of opinions or suggestions.
4. **Answers:** Offer three to four choices per question, ensuring one correct answer and other plausible alternatives. The incorrect choices should be close enough to test comprehension but distinct enough to be identified by a careful reader.
5. **Engagement:** Ensure questions not only test factual recall but also comprehension of subtler aspects of the text, like attitudes or indirect information.

Create questions that challenge B1 level learners to demonstrate a deeper understanding of the text, going beyond mere recall of information.

Output as JSON following this example:
{
  "question_number": represents the number of the question,
  "question": the question text,
  "correct_answer": contains the correct answer to the question,
  "distractor_1": incorrect option or distractor,
  "distractor_2": incorrect option or distractor, 
  "distractor_3": incorrect option or distractor,
}`,
                user: `Formulate a set of 10 multiple-choice questions based on the given ${passage}, suitable for readers at the B1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "B2": {
            fiction: {
                system: ` 
Key Guidelines:
1. **Question Style:** Formulate questions that test a deeper understanding and interpretation of the story, including themes, character arcs, narrative techniques, and subtler aspects of the plot.
2. **Vocabulary and Grammar:** Employ a rich and varied vocabulary, including idiomatic expressions and more complex grammatical structures. Questions can challenge the reader's understanding of language and style.
3. **Content Focus:** Questions should cover complex character motivations, plot developments, thematic elements, and authorial intent. Encourage analytical and critical thinking.
4. **Answers:** Provide four nuanced answer options, ensuring one correct answer. Distractors should be challenging and plausible, requiring careful reading and interpretation to differentiate.
5. **Engagement:** Motivate readers to think critically about the story, analyzing language, style, and deeper meanings beyond the surface narrative.

Design questions that challenge B2 level learners to delve into more sophisticated analysis of the story, considering aspects such as symbolism, tone, and complex character dynamics.

Output as JSON following this example:
{
  "question_number": represents the number of the question,
  "question": the question text,
  "correct_answer": contains the correct answer to the question,
  "distractor_1": incorrect option or distractor,
  "distractor_2": incorrect option or distractor, 
  "distractor_3": incorrect option or distractor,
}`,
                user: `Compose a series of 10 multiple-choice questions targeting a deeper comprehension and analysis of the ${passage}, aimed at readers at the B2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Style:** Craft questions that probe into understanding of main ideas, details, implications, and author's attitudes. Questions can also address the structure and argumentation within the text.
2. **Vocabulary and Grammar:** Use a rich and varied vocabulary, including abstract and technical terms where relevant. Include complex sentence structures with subordinate clauses and a variety of verb tenses and moods.
3. **Content Focus:** Questions should assess understanding of complex and abstract topics, as well as the logic, development, and support of arguments. Include items that require critical thinking and interpretation of the text.
4. **Answers:** Provide four answer options, with one correct answer and three distractors that are plausible but can be discerned through careful reading and analysis.
5. **Engagement:** Ensure questions engage the reader in critical thinking and deep analysis of the text, including assessing the logic of arguments and the effectiveness of evidence used.

Develop questions that encourage B2 level learners to engage with the text at a deeper level, understanding not only what is directly stated but also what is implied or suggested.

Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "correct_answer": contains the correct answer to the question,
    "distractor_1": incorrect option or distractor,
    "distractor_2": incorrect option or distractor, 
    "distractor_3": incorrect option or distractor,
}`,
                user: `Construct a series of 10 multiple-choice questions based on the specified ${passage}, aimed at readers at the B2 level of the Common European Framework of Reference for Languages (CEFR).`,
            },
        },
        "C1": {
            fiction: {
                system: `     
Key Guidelines:
1. **Question Style:** Questions should require an advanced understanding of the story, probing into abstract themes, sophisticated narrative techniques, and subtle nuances in character development and plot progression.
2. **Vocabulary and Grammar:** Utilize a sophisticated range of vocabulary and complex sentence structures, reflecting a high level of language proficiency. Incorporate literary terms and nuanced expressions.
3. **Content Focus:** Direct questions towards intricate aspects of the story, such as the author's stylistic choices, deeper symbolic meanings, and intricate plot elements. Questions should stimulate a critical and interpretative response.
4. **Answers:** Offer four well-crafted answer choices that demand discernment and insight to identify the correct one. Distractors should be closely related to the text but distinct enough to test deep comprehension and interpretation.
5. **Engagement:** Encourage a profound engagement with the story, inviting learners to analyze and reflect on the text's deeper messages and artistic qualities.

Construct questions that engage C1 level learners in sophisticated analysis and interpretation of the story, challenging them to explore and appreciate complex literary elements and deeper meanings.

Output as JSON following this example:
{
  "question_number": represents the number of the question,
  "question": the question text,
  "correct_answer": contains the correct answer to the question,
  "distractor_1": incorrect option or distractor,
  "distractor_2": incorrect option or distractor, 
  "distractor_3": incorrect option or distractor,
}`,
                user: `Design a set of 10 challenging multiple-choice questions based on the ${passage} for readers at the C1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Style:** Construct questions that delve into complex ideas, nuanced arguments, and abstract concepts. Include questions on the author's tone, style, and the effectiveness of their argumentation.
2. **Vocabulary and Grammar:** Employ advanced and nuanced vocabulary, including idiomatic, figurative, and specialized language. Questions should feature complex grammatical structures, with a mix of dependent clauses, passive forms, and nuanced modal verb usage.
3. **Content Focus:** Formulate questions that assess critical understanding and interpretation of the text, including the exploration of themes, detailed argument analysis, and understanding of indirect or between-the-lines information.
4. **Answers:** Provide four sophisticated and closely related options, with one clearly correct answer that requires careful thought and deeper understanding to identify.
5. **Engagement:** Challenge the reader's ability to analyze, synthesize, and evaluate information from the text, encouraging a deep engagement with the material.

Compose questions that stimulate C1 level learners to apply advanced critical thinking skills and comprehensive language understanding to grasp the full depth and breadth of the article's content.

Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "correct_answer": contains the correct answer to the question,
    "distractor_1": incorrect option or distractor,
    "distractor_2": incorrect option or distractor, 
    "distractor_3": incorrect option or distractor,
}`,
                user: `Formulate a set of 10 intricate multiple-choice questions based on the given ${passage}, aimed at readers at the C1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "C2": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Style:** Craft questions that probe deeply into the story's thematic depth, stylistic intricacies, and narrative complexities. Encourage interpretations that reflect a profound understanding of literary techniques and the subtleties of the language.
2. **Vocabulary and Grammar:** Use highly advanced vocabulary and complex grammatical structures, mirroring the sophistication expected at the C2 level. Include specialized literary terms and abstract concepts.
3. **Content Focus:** Questions should delve into the finer aspects of the story, such as the author's philosophical underpinnings, intricate character psychology, sophisticated interplay of narrative elements, and metaphorical or symbolic meanings.
4. **Answers:** Construct four intricate and closely related answer choices that challenge the reader's ability to discern and appreciate subtle nuances. The correct answer should demand a deep and comprehensive understanding of the text.
5. **Engagement:** Foster a level of engagement that requires a mature, critical, and reflective approach to reading, interpreting, and appreciating literature.

Design these questions to challenge C2 level learners' highest capacities in literary analysis, critical thinking, and appreciation of complex narrative structures and themes.
{
    "question_number": represents the number of the question,
    "question": the question text,
    "correct_answer": contains the correct answer to the question,
    "distractor_1": incorrect option or distractor,
    "distractor_2": incorrect option or distractor, 
    "distractor_3": incorrect option or distractor,
}`,
                user: `Develop a series of 10 complex and nuanced multiple-choice questions based on the ${passage}, intended for readers at the C2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Style:** Frame questions that test a deep and nuanced understanding of complex, abstract ideas and stylistic subtleties in the text. Include questions on the implications, underlying assumptions, and theoretical perspectives.
2. **Vocabulary and Grammar:** Utilize sophisticated and precise vocabulary, with a focus on nuanced expression and stylistic features. Structure questions with intricate grammatical constructions, including a mix of advanced tenses, moods, and voices.
3. **Content Focus:** Questions should evaluate the learner's ability to critically assess, synthesize, and interpret ideas. Focus on the analysis of argument structures, rhetorical strategies, and the effective use of evidence in the text.
4. **Answers:** Offer four nuanced answer choices, requiring discerning judgment and deep comprehension to select the correct one. Distractors should be plausible but distinguishable through critical analysis and detailed understanding of the text.
5. **Engagement:** Challenge readers to engage critically with the text, analyzing and evaluating its assertions, methodology, and conclusions at a sophisticated level.

Craft questions that require C2 level learners to engage deeply with the text, utilizing their full range of linguistic skills and critical thinking abilities to interpret and evaluate complex ideas and arguments.

Output the questions as strict JSON,  with the following fields:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "correct_answer": contains the correct answer to the question,
    "distractor_1": incorrect option or distractor,
    "distractor_2": incorrect option or distractor, 
    "distractor_3": incorrect option or distractor,
}`,
                user: `Develop a series of 10 challenging multiple-choice questions based on the specified ${passage}, tailored for readers at the C2 level of the Common European Framework of Reference for Languages (CEFR).`,
            },
        },
    };

    // const system_propmt = fs.readFileSync(`./data/prompts/${level}_system_prompt_MC.txt`, "utf8");
    // const user_propmt = `Devise a set of 10 simple multiple-choice questions based on the provided ${story}, intended for readers at the A1 level of the Common European Framework of Reference for Languages (CEFR).`;
    // Create questions that help A1 level learners to focus on and recall the most basic and clear-cut details of the story.

    // Key Guidelines:
    // 1. **Question Style:** Questions should be very straightforward, focusing on basic factual details and literal comprehension of the story. Avoid any abstract or inferred meanings.
    // 2. **Vocabulary and Grammar:** Use very simple language and basic sentence structures. Ensure the vocabulary and grammar used in the questions and answers are accessible to beginners.
    // 3. **Content Focus:** Base questions on concrete and easily identifiable elements of the story, such as main characters, basic settings (e.g., a house, a park), and key events.
    // 4. **Answers:** Provide three to four simple answer options, making sure that the correct answer is clearly identifiable and the distractors are obviously incorrect.
    // 5. **Engagement:** Encourage engagement with the story by asking about straightforward details that can be directly recalled from the text.

    // Output as JSON following this example:
    // {
    //     "question_number": represents the number of the question,
    //     "question": the question text,
    //     "correct_answer": contains the correct answer to the question,
    //     "distractor_1": incorrect option or distractor,
    //     "distractor_2": incorrect option or distractor, 
    //     "distractor_3": incorrect option or distractor,
    // }

    // Remove - + and space from level
    let level_clean = level.replace(/[-\s+]/g, "");
    if (level_clean == "A0") {
        level_clean = "A1";
    }
    const schema = {
        type: "object",
        properties: {
            multiple_choice_questions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question_number: {
                            type: "number",
                            description: "The number of the question.",
                        },
                        question: {
                            type: "string",
                            description: "The question text.",
                        },
                        correct_answer: {
                            type: "string",
                            description: "The correct answer to the question.",
                        },
                        distractor_1: {
                            type: "string",
                            description: "Incorrect option or distractor.",
                        },
                        distractor_2: {
                            type: "string",
                            description: "Incorrect option or distractor.",
                        },
                        distractor_3: {
                            type: "string",
                            description: "Incorrect option or distractor.",
                        },
                    },
                },
            },
        },
        required: [
            "multiple_choice_questions",
        ],
    };
    try {
        console.time("Generating questions");
        // console.log("Generating questions...");
        // console.log("system_propmt:", MC_propmts[level_clean][type].system);
        // console.log("user_propmt:", MC_propmts[level_clean][type].user);
        const reponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: MC_propmts[level_clean][type].system,
                },
                {
                    role: "user",
                    content: MC_propmts[level_clean][type].user,
                },
            ],
            functions: [
                {
                    name: "generate_multiple_choice_questions",
                    description: "Generate multiple-choice questions based on a given passage.",
                    parameters: schema,
                },
            ],
            function_call: {
                name: "generate_multiple_choice_questions",
            },
            temperature: 0.5,
        });
        const data = JSON.parse(
            reponse.choices[0].message.function_call?.arguments as string
        )

        // console.log("data:", data);

        //Validate the data that hvae 10 questions abd correct answers format
        if (data.multiple_choice_questions.length !== 10) {
            console.log("data.multiple_choice_questions.length:", data.multiple_choice_questions.length);
            throw new Error("Number of questions generated is not 10.");
        }
        for (const question of data.multiple_choice_questions) {
            if (
                !question.question_number ||
                !question.question ||
                !question.correct_answer ||
                !question.distractor_1 ||
                !question.distractor_2 ||
                !question.distractor_3
            ) {
                console.log("question:", JSON.stringify(question, null, 2));
                throw new Error("Questions are not in the correct format.");
            }
        }
        // return {
        //     type: data.type,
        //     genre: data.genre,
        //     subgenre: data.subgenre,
        //     title: data.title,
        //     summary: data.summary,
        //     image_description: data.image_description,
        //     passage: story,
        // };
        return data.multiple_choice_questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    } finally {
        console.timeEnd("Generating questions");
    }
}

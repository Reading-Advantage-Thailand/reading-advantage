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
    sugguested_answer: string;
}

export async function SA_generator(
    level: string,
    passage: string,
    type: string,
) {

    const SA_propmts: any = {
        "A1": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Simplicity:** Formulate a question that deals with the most basic elements of the story, such as naming characters, identifying a simple action, or recognizing the setting.
2. **Language Use:** Employ very basic and clear language, using elementary vocabulary and simple sentence structures. The question should be easily understandable by an A1 learner.
3. **Response Content:** The answer should be about recognizing or naming something very simple and concrete from the story.
4. **Focus Areas:** Focus on basic facts and direct observations from the story, such as 'Who is in the story?' or 'What does the character see?'
5. **Expected Answer:** Answers should be very short, one-word or phrase responses that require minimal language production and understanding.

These questions are designed to verify a beginner (A1) learner's ability to identify and understand the simplest and most direct information from the story.

Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible single-sentence answer using language appropriate to CEFR A1 learners,
}`,
                user: `Craft 5 extremely simple and direct short-answer questions based on the ${passage}, tailored for readers at the A1 level of the Common European Framework of Reference for Languages (CEFR).`,
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Simplicity:** The question should be extremely basic, asking about very clear and concrete details in the article, such as names, colors, sizes, or other easily identifiable attributes.
2. **Language Use:** Employ elementary vocabulary and very basic sentence structures. The language of the question should be accessible to complete beginners in English.
3. **Response Content:** Anticipate a straightforward and short answer that directly reflects simple information found in the article. The response should require minimal language skills to express.
4. **Focus Areas:** The question should target the simplest facts or elements in the article, such as identifying a common object, basic action, or simple characteristic mentioned.
5. **Expected Answer:** The answer should be very brief, possibly one or two words, showing the learner's ability to understand and recall the most basic information from the text.

These types of questions are designed to evaluate an A1 learner's very basic comprehension of the article, focusing on their ability to recall straightforward and simple facts or details.

Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible single-sentence answer using language appropriate to CEFR A1 learners,
}`,
                user: `Formulate 5 very simple and clear short-answer questions from the ${passage}, aimed at readers at the A1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "A2": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Simplicity:** Frame a question that focuses on the most basic elements of the story, such as what happens, where the story takes place, or who the main characters are.
2. **Language Use:** Use very simple language, with basic vocabulary and sentence structures. The question should be clear and easily comprehensible to an A2 learner.
3. **Response Content:** The answer should require the reader to recall or identify clear, concrete details or actions in the story.
4. **Focus Areas:** Direct attention to straightforward facts about the story such as the setting, main events, or descriptions of characters.
5. **Expected Answer:** Answers should be brief, factual, and require little to no inference or analysis.

These questions are meant to check an A2 learner's basic understanding of the story, focusing on direct recall of simple, concrete narrative details.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR A2 learners,
}`,
                user: `Develop 5 simple and straightforward short-answer questions based on the ${passage}, suitable for readers at the A2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Simplicity:** The question should be very basic, focusing on straightforward facts or ideas in the article. It should avoid any complexity and be easy for A2-level learners to comprehend.
2. **Language Use:** Utilize simple vocabulary and sentence structures. The question should be framed in an elementary manner, using commonly known words and phrases.
3. **Response Content:** The expected answer should be simple and direct, reflecting clear and basic information found in the article. The response should require the reader to recall or recognize simple facts or ideas.
4. **Focus Areas:** Focus the question on very concrete and specific information, such as names, dates, basic descriptions, or easy-to-identify details mentioned in the article.
5. **Expected Answer:** The answer should be brief, requiring only a basic level of English to express. It should demonstrate the learner's ability to understand and convey simple information from the text.

This type of question aims to assess the A2 learner's basic comprehension and ability to recall or identify simple, factual information presented in the nonfiction article.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR A2 learners,
}`,
                user: `Develop 5 basic, easy-to-understand short-answer questions from the ${passage}, suitable for readers at the A2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "B1": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Simplicity:** The question should be straightforward, focusing on basic elements of the story such as main events, simple character descriptions, and clear themes.
2. **Language Use:** Employ simple and clear language appropriate for B1-level learners, using a limited range of vocabulary and basic sentence structures.
3. **Response Content:** The answer should demonstrate a clear understanding of the story's main narrative or a primary character. It should not require deep analysis or complex reasoning.
4. **Focus Areas:** Concentrate on the main storyline, actions of characters, or obvious moral or message of the story.
5. **Expected Answer:** The answer should be concise and factual, reflecting the reader's ability to comprehend and recount basic elements of the story.

These types of questions are designed to assess a B1 learner's ability to grasp the fundamental components of the fiction story and articulate them in a clear, straightforward manner.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR B1 learners,
}`,
                user: `Formulate 5 simple and direct short-answer questions from the ${passage}, aimed at readers at the B1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Simplicity:** Formulate a question that is straightforward and easy to understand. It should focus on the recall of clear, factual information or basic ideas presented in the article.
2. **Language Appropriateness:** Use clear and simple language, avoiding complex vocabulary or sentence structures. The question should be accessible to B1-level learners, requiring them to use basic language skills to respond.
3. **Response Content:** Expect an answer that directly reflects the information in the article, showing understanding of the main points or specific facts. The response should be brief and factual, without the need for elaborate explanation or analysis.
4. **Focus Areas:** The question can address the main topic, key facts, or simple conclusions drawn in the article. It should test the reader's ability to understand and remember basic information.
5. **Expected Answer:** The answer should be short and to the point, demonstrating the learner's ability to comprehend and recall the primary content of the article.

This type of question is designed to evaluate a B1 learner's grasp of essential information in the article and their ability to communicate it using straightforward, simple language.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR B1 learners,
}`,
                user: `Craft 5 simple, direct short-answer questions from the ${passage}, tailored for readers at the B1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "B2": {
            fiction: {
                system: ` 
Key Guidelines:
1. **Question Clarity:** Formulate a question that addresses clear elements of the story such as main plot points, character relationships, or basic themes.
2. **Language Use:** The question should use a variety of vocabulary and sentence structures typical of B2 proficiency, avoiding overly complex language or abstract concepts.
3. **Response Content:** Expect answers that demonstrate a solid understanding of the story's main events, character motivations, or moral messages.
4. **Focus Areas:** Target the narrative's key elements, like the resolution of the main conflict, the growth of a central character, or the story's setting and how it affects the plot.
5. **Expected Answer:** The answer should be more than a simple fact or detail from the story; it should show the reader's ability to connect ideas and provide a thoughtful, yet not overly complex, response.

These questions are tailored to gauge a B2 learner's understanding of the narrative structure and character dynamics in the fiction story, assessing their ability to link different elements of the text and express their thoughts with a good level of language control.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR B2 learners,
}`,
                user: `Construct 5 clear and focused short-answer questions from the ${passage}, appropriate for readers at the B2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Clarity:** The question should be direct, focusing on the understanding of key ideas or details in the article. It should encourage the reader to apply the information learned in a straightforward manner.
2. **Language Use:** Employ clear, moderately complex vocabulary and sentence structures appropriate for B2-level readers. The question should be comprehensible yet challenging enough to stimulate detailed responses.
3. **Response Detail:** Expect a response that shows a clear understanding of the article, with answers that are precise and to the point, demonstrating good control of vocabulary and structure.
4. **Focus Areas:** The question may cover the main arguments, specific examples, or conclusions drawn in the article. It should encourage the reader to recall and apply specific information.
5. **Expected Answer:** The answer should display the reader's ability to accurately understand and convey information from the article, including important details and some nuanced understanding.

This question type is crafted to assess B2 learners' ability to comprehend important content and articulate their understanding in clear, well-structured responses.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR B2 learners,
}`,
                user: `Formulate 5 clear and specific short-answer question based on the ${passage}, aimed at readers at the B2 level of the Common European Framework of Reference for Languages (CEFR).`,
            },
        },
        "C1": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Insightfulness:** The question should probe into the more sophisticated aspects of the story, like character development, narrative perspective, or the author's use of language.
2. **Language Use:** Utilize advanced language suitable for C1-level learners, incorporating a range of vocabulary and more complex sentence structures than lower levels.
3. **Response Content:** Encourage answers that demonstrate understanding of subtleties in the story, such as interpretations of characters' actions, the significance of certain events, or the effectiveness of the story's structure.
4. **Focus Areas:** Questions can explore detailed aspects of the plot, deeper character analysis, thematic exploration, or the author's stylistic choices.
5. **Expected Answer:** The answer should reflect a high level of understanding, using varied and rich language to convey complex ideas or interpretations related to the story.

These types of questions are crafted to test a C1 learner's ability to understand and articulate complex concepts and narrative elements within the fiction story, demonstrating advanced language proficiency and critical thinking skills.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR C1 learners,
}`,
                user: `Design 5 insightful short-answer questions from the ${passage}, targeted at readers at the C1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
1. **Question Depth:** The question should encourage a detailed understanding of the article, asking the reader to explain, compare, or analyze key concepts or arguments presented.
2. **Language and Structure:** Use clear, yet advanced vocabulary and sentence structures. The question should be phrased to elicit a response that demonstrates a high level of fluency and language control, though not necessarily with the intricacy expected at C2.
3. **Response Content:** Expect an answer that shows the reader can competently discuss and elucidate the main ideas, employing a good range of vocabulary and clear organization of thoughts.
4. **Focus Areas:** The question may address significant themes, author’s perspectives, or the implications of the information presented in the article.
5. **Expected Answer:** While the answer should show depth and comprehension, it need not delve into highly theoretical or abstract interpretations. It should be informed, articulate, and well-structured.

This question is designed to test C1 learners' ability to comprehend complex ideas, articulate a well-reasoned response, and utilize a diverse vocabulary and varied sentence structures.
Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR C1 learners,
}`,
                user: `Develop 5 detailed short-answer questions based on the ${passage}, suitable for readers at the C1 level of the Common European Framework of Reference for Languages (CEFR).`
            },
        },
        "C2": {
            fiction: {
                system: `
Key Guidelines:
1. **Question Complexity:** The question should delve into complex aspects of the story, such as themes, character motivations, narrative techniques, or stylistic elements.
2. **Language Use:** Use sophisticated and nuanced language appropriate for C2-level learners. The question can include advanced vocabulary and complex sentence structures.
3. **Response Content:** The expected answer should be reflective, analytical, or inferential, showcasing the reader's ability to engage with the story on a deep level. It might involve interpretation, critical analysis, or understanding of subtle nuances.
4. **Focus Areas:** Questions can focus on abstract themes, the author's style, the impact of cultural or historical contexts, or the exploration of characters' psychological dimensions.
5. **Expected Answer:** The answer should be comprehensive and articulated in advanced language, demonstrating a high level of understanding and engagement with the text.

Example question format:
- How does the author use symbolism to enhance the story's main theme? 
- Discuss how the protagonist's transformation throughout the story reflects broader societal changes.

These types of questions aim to assess a C2 learner's sophisticated comprehension of the narrative, their ability to analyze literary elements, and their engagement with deeper, more abstract aspects of the story.

Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR C1 learners,
}`,
                user: `Develop an advanced short-answer 5 questions from the ${passage}, suitable for readers at the C2 level of the Common European Framework of Reference for Languages (CEFR).`
            },
            nonfiction: {
                system: `
Key Guidelines:
1. **Question Complexity:** The question should prompt an analysis or interpretation that reflects a deep and nuanced understanding of the article's subject matter. It should challenge the reader to think critically and analytically about the content.
2. **Language Use:** Utilize advanced vocabulary and complex grammatical structures befitting a C2-level reader. The question should be phrased in a way that demands a sophisticated response.
3. **Response Depth:** Encourage an answer that showcases the reader's ability to engage with complex ideas, utilize a broad and nuanced vocabulary, and articulate a clear, well-structured argument or explanation.
4. **Focus Areas:** The question can address intricate details, theoretical concepts, author's intent, underlying assumptions, or implications of the article's content.
5. **Expected Answer:** The response should be more than a simple factual reply; it should reflect the reader's capacity to express ideas eloquently and thoughtfully, with a high degree of language control.

Example question format:
- Based on the article's discussion of environmental policies, how might differing economic priorities of countries shape their approach to climate change, and what are the potential global impacts of these differing priorities?

This type of question should challenge C2 level learners to demonstrate not only their comprehension of the article but also their ability to critically engage with its themes and articulate a complex, detailed response.

Output as JSON following this example:
{
    "question_number": represents the number of the question,
    "question": the question text,
    "suggested_answer": a possible answer using language appropriate to CEFR C1 learners,
}`,
                user: `Formulate a challenging short-answer 5 questions based on the ${passage}, targeting readers at the C2 level of the Common European Framework of Reference for Languages (CEFR).`,
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
    if (level_clean === "A0") {
        level_clean = "A1";
    }
    const schema = {
        type: "object",
        properties: {
            short_answer_questions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question_number: {
                            type: "number",
                        },
                        question: {
                            type: "string",
                        },
                        suggested_answer: {
                            type: "string",
                        },
                    },
                },
            },
        },
        required: [
            "short_answer_questions",
        ],
    };
    try {
        console.time("Generating questions");
        // console.log("level:", level_clean);
        // console.log("type:", type);
        // console.log('system:', SA_propmts[level_clean][type].system);
        // console.log('user:', SA_propmts[level_clean][type].user);
        // console.log("Generating questions...");
        // console.log("system_propmt:", SA_propmts[level_clean][type].system);
        // console.log("user_propmt:", SA_propmts[level_clean][type].user);
        const reponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: SA_propmts[level_clean][type].system,
                },
                {
                    role: "user",
                    content: SA_propmts[level_clean][type].user,
                },
            ],
            functions: [
                {
                    name: "generate_short_answer_questions",
                    description: "Generate short answer questions based on the provided passage.",
                    parameters: schema,
                },
            ],
            function_call: {
                name: "generate_short_answer_questions",
            },
            temperature: 0.5,
        });
        // console.log("reponse:", JSON.stringify(reponse, null, 2));
        const data = JSON.parse(
            reponse.choices[0].message.function_call?.arguments as string
        )

        // console.log("data:", JSON.stringify(data));

        //Validate the data that hvae 5 questions and answers
        if (data.short_answer_questions.length !== 5) {
            // console.log('data:', data)
            console.log("data.short_answer_questions.length:", data.short_answer_questions.length);
            throw new Error("The number of questions generated is not 5");
        }
        // console.log("data:", data);
        for (const question of data.short_answer_questions) {
            if (!question.question_number || !question.question || !question.suggested_answer) {
                console.log("question:", JSON.stringify(question, null, 2));
                throw new Error("The question is missing some properties");
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
        return data.short_answer_questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    } finally {
        console.timeEnd("Generating questions");
    }
}

// route: /api/assistant/questions
import db from "@/configs/firestore-config";
import OpenAI from "openai";

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  try {
    console.log('assistant/questions');
    const { threadId, articleId } = await req.json();
    const assistantId = 'asst_cmS72OcbZsNT20ndfjhBgQgx';
    const mcq = await assistant('/mcquestions', assistantId, threadId);

    console.log('mcq: ', (mcq as any)[0].content[0].text.value);
    const mcqString = (mcq as any)[0].content[0].text.value;
    const mcqFormatted = formatQuestions(mcqString);
    const mcqJson = JSON.parse(mcqFormatted);
    console.log('mcqJson: ', mcqJson);

    const mcqJsonWithAnswers = mcqJson.questions.map((question: any) => {
      const answers = {
        answer_a: question.correct_answer,
        answer_b: question['distractor 1'],
        answer_c: question['distractor 2'],
        answer_d: question['distractor 3'],
      }
      return {
        question: question.question,
        answers: answers,
      }
    });

    const saq = await assistant('/saquestions', assistantId, threadId);
    console.log('saq: ', (saq as any)[0].content[0].text.value);
    // remove ```json and ``` from the string
    const saqString = (saq as any)[0].content[0].text.value;
    const saqFormatted = formatQuestions(saqString);
    const saqJson = JSON.parse(saqFormatted);

    const saqJsonWithAnswers = saqJson.questions.map((question: any) => {
      return {
        question: question.question,
        suggested_answer: question.suggested_answer,
      }
    });
    const questions = {
      multiple_choice_questions: mcqJsonWithAnswers,
      short_answer_question: saqJsonWithAnswers,
    }
    console.log('questions: ', questions);

    const articleRef = db.collection('articles').doc(articleId).update({
      questions: questions,
    });

    if (process.env.NODE_ENV === 'development') {
      const article = await db.collection('assistant-articles').doc(articleId).update({
        questions: questions,
      });
    }

    return new Response(JSON.stringify({
      messages: 'success',
      assistantId: assistantId,
      questions: questions,
    }), { status: 200 });

  } catch (error) {
    console.error(error);
  }
}

function formatQuestions(questions: string): string {
  // If the questions is not included in a backet, add it
  if (!questions.includes('[') && !questions.includes(']')) {
    questions = `{"questions":[${questions}]}`;
  }
  // qusetion have json invalid format replace('```json', '').replace('```', '');
  questions = questions.replace('```json', '').replace('```', '');
  return questions;
}

async function assistant(command: string, assistantID: string, threadId: string) {
  try {

    const thread = await openai.beta.threads.retrieve(threadId);
    console.log('thread', thread);
    // Create message
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: command,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantID,
    });

    // Preiodically check for completion
    const retrieveRunStatus = async () => {
      let keepRetrieving;
      while (run.status !== 'completed') {
        keepRetrieving = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id
        );
        if (keepRetrieving.status === 'completed') {
          break;
        }
      }
    }
    retrieveRunStatus();

    // Retrieve the messages from the assistant
    const retrieveMessages = async () => {
      await retrieveRunStatus();
      const messages = await openai.beta.threads.messages.list(thread.id);
      // console.log('messages', messages);
      return messages.data;
    }

    // Wait for retrieveMessages to complete and send the response
    const response = await retrieveMessages();
    return response;
  } catch (error) {
    console.log('error', error);
    return error;
  }
}
// /about the user may define the type, genre, subgenre, topic, wordcount, and target words per sentence
// ---
// /outline write an outline STRICTLY to the specification
// ---
// /passage write the passage to to outline and TO A MINIMUM of the wordcount
// ---
// /revise revise the passage to be longer and more aligned to the the requirements
// ---
// /assets create a title, one-sentence summary with no spoilers, and a description of an image to be displayed with the passage
// ---
// /json
// Return everything only in JSON using this format:
// {
// "type": "fiction"
// genre: if no genre is provided, choose one randomly
// subgenre: if no subgenre is provided, choose one randomly
// topic: if no specific topic is provided, choose one randomly
// target-wordcount: if no wordcount is specified, the passage should be AT LEAST 400 words long
// target-words-per-sentence:
// outline: write a basic outline of the passage before writing the actual passage
// passage: write the passage strictly to the target wordcount or greater AND NO SHORTER, following the outline, above
// summary: a one-sentence summary with no spoilers
// title: an interesting and level-appropriate title
// image: a detailed description of an image to go with the article.
// }
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// main
const main = async () => {
    const assistant = await openai.beta.assistants.retrieve('asst_cmS72OcbZsNT20ndfjhBgQgx');
    const thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: '/about'
    });
    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
    });
    const assistantResponse = run.choices[0].message.content;
    console.log(assistantResponse);
    // res.json({ description: assistantResponse });
};
main();
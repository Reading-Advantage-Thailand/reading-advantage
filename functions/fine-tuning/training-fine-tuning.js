const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
async function generateArticle() {
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        // read file from data/test/A1-fiction.json

    });
}

generateArticle();
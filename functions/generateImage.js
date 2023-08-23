// generate image from the article content
// step 1: get the article content
// step 2: get 5 words from the content
// step 3: get the image generated from the 5 words
// Possible prompt:
// "Please provide five words (concrete nouns or action verbs, only) describing a picture that will be displayed alongside the following article: {article text}"

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');
dotenv.config({ path: '.env' });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
async function generateWordsPrompt(articleContent) {
    const prompt = `Please imagine an image to go with the following article and provide one subject-verb-object sentence of no more than ten words describing this picture. Also include information about the style, background, elements, colors, and composition. \narticle: ${articleContent}`;
    // console.log('prompt:', prompt);
    const schema = {
        type: 'object',
        properties: {
            articleDescription: {
                type: 'string',
                description: 'A subject-verb-object sentence and information about composition, cookies, etc. describing an image to be presented with the article',
            },
        },
        required: ['articleDescription'],
    };

    const res = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                "role": "system",
                "content": "You are a article database assistant.",
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        functions: [
            {
                "name": 'get_article_description',
                "parameters": schema,
            },
        ],
        function_call: {
            name: 'get_article_description',
        },
    });
    const result = JSON.parse(res.data.choices[0].message.function_call.arguments);
    return result;
};

async function generateImageFromWords(words) {
    const response = await openai.createImage({
        prompt: words,
        n: 1,
        size: "512x512",
    });
    image_url = response.data.data[0].url;
    // download the image
    const image_path = path.join(__dirname, '../data/articles-images/image.png');
    //display the image
    // console.log('image url:', image_url);
    console.log('image generated');
    return image_url;

};

async function downloadImage(image_url, save_path) {
    const response = await axios.get(image_url, {
        responseType: 'arraybuffer',
    });
    // console.log('response:', response);
    // save the image to the path
    fs.writeFileSync(save_path, response.data);
    console.log('image downloaded');
    return;
}

// main
(async () => {
    console.log('start');
    // get json file
    const jsonFilePath = './articles_firestore.json';
    const articles = require(jsonFilePath);
    const startIndex = 1046;
    const endIndex = 1500;
    const result = [];
    // get the article content
    for (let i = startIndex; i < endIndex; i++) {
        // console.log('article:', articles[i]);
        const articleContent = articles[i].content;
        // const articleContent = "Once upon a time, in a small village, there lived two friends named Jack and Emily. They were always curious and loved exploring the woods near their village. One sunny day, as they were wandering through the trees, they stumbled upon a hidden path. Intrigued, they decided to follow it. Little did they know, this path would lead them to a magical land filled with talking animals. As Jack and Emily ventured further into the hidden land, they encountered a wise old owl named Oliver. Oliver explained that this land was a sanctuary for animals who could speak and think just like humans. The animals had their own society, with a mayor, schools, and even a library. But there was a problem. A wicked witch named Morgana had cast a spell on the land, causing all the animals to lose their ability to speak. The animals were desperate for help, and Jack and Emily knew they had to do something. With Oliver's guidance, Jack and Emily set out on a quest to find the magical flower that could break Morgana's spell. They faced many challenges along the way, but their determination never wavered. Finally, after days of searching, they found the enchanted flower hidden deep within a dark cave. The flower glowed with a soft, golden light, and they knew it was the key to saving the talking animals. Jack and Emily rushed back to the animal sanctuary and presented the flower to the mayor. As soon as the flower touched the ground, a wave of magic spread throughout the land. The animals regained their ability to speak and were overjoyed. To show their gratitude, the animals organized a grand feast in honor of Jack and Emily. There was delicious food, lively music, and laughter filled the air. It was a celebration like no other. From that day forward, Jack and Emily became heroes in the hidden land. They were loved and respected by all the animals. They visited the land often, sharing stories and laughter with their newfound friends. And so, the tale of Jack and Emily, the friends who stumbled upon a hidden land of talking animals, spread far and wide. It became a legend, passed down from generation to generation, reminding everyone of the power of friendship and the magic that can be found in unexpected places.";
        // console.log('article content:', articleContent);
        console.log('index:', i);
        console.log('docId:', articles[i].docId)
        // get 5 words from the content
        const res = await generateWordsPrompt(articleContent).then((res) => {
            if (res.length > 500) {
                console.log('response greater than 500 characters');
                console.log('res length:', res.length);
            }
            return res;
        }).catch((error) => {
            console.error('Error generating article:', error.message);
        });
        const words = res.articleDescription;
        console.log('words:', words);
        // get the image generated from the 5 words
        const image_url = await generateImageFromWords(words).then((image_url) => {
            return image_url;
        }).catch((error) => {
            console.error('Error generating image:', error.message);
        });
        // console.log('image url:', image_url);
        // download the image
        const image_path = path.join(__dirname, `../data/article-images/${articles[i].docId}.png`);
        await downloadImage(image_url, image_path).then(() => {
            console.log('image downloaded');
        }).catch((error) => {
            console.error('Error downloading image:', error.message);
        });

        // update the article with the image url
        articles[i].imagePrivateUrl = image_url;
        articles[i].imageName = `${articles[i].docId}.png`;
        articles[i].description = words;

        const article = {
            docId: articles[i].docId,
            title: articles[i].title,
            content: articles[i].content,
            type: articles[i].type,
            genre: articles[i].genre,
            subGenre: articles[i].subGenre,
            topic: articles[i].topic,
            grade: articles[i].grade,
            ari: articles[i].ari,
            cefrScores: articles[i].cefrScores,
            raLevel: articles[i].raLevel,
            imagePrivateUrl: articles[i].imagePrivateUrl,
            imageName: articles[i].imageName,
            description: articles[i].description,
        };
        result.push(article);
        fs.writeFileSync('./article_firestore_images_7.json', JSON.stringify(result));
    }
})();



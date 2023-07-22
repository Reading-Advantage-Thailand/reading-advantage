const catchAsync = require("../utils/catchAsync");
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function addOrdinalSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const num = Number(number);
    const lastTwoDigits = num % 100;
    const suffix = suffixes[(lastTwoDigits - 20) % 10] || suffixes[lastTwoDigits] || suffixes[0];
    return num + suffix;
}

exports.getArticle = catchAsync(async (req, res, next) => {
    const {
        type,
        genre,
        subGenre,
        topic,
        lowLevel,
        midLevel,
        highLevel
    } = req.body;

    const levels = [
        lowLevel,
        midLevel,
        highLevel
    ]
    const prompts = [
        `Please write an article for a fictional story of about ${(90 + 140) * lowLevel} words in the genre of ${genre} and subgenre of ${subGenre}. The title and concept for the story are ${topic}. Write it to a ${addOrdinalSuffix(lowLevel)} grade reading level.`,
        `Please wrote an article for a fictional story of about ${(90 + 140) * midLevel} words in the genre of ${genre} and subgenre of ${subGenre}. The title and concept for the story are ${topic}. It is written to a ${addOrdinalSuffix(midLevel)} grade reading level.`,
        `Please write an article for a fictional story of about ${(90 + 140) * highLevel} words in the genre of ${genre} and subgenre of ${subGenre}. The title and concept for the story are ${topic}. Write it to a ${addOrdinalSuffix(highLevel)} grade reading level.`
    ];
    // const articleLowLevel = await generateArticle(
    //     prompts[0],
    //     type,
    //     genre,
    //     subGenre,
    //     topic,
    //     levels[0]
    // );
    // const articleMidLevel = await generateArticle(
    //     prompts[1],
    //     type,
    //     genre,
    //     subGenre,
    //     topic,
    //     levels[1]
    // );
    // const articleHighLevel = await generateArticle(
    //     prompts[2],
    //     type,
    //     genre,
    //     subGenre,
    //     topic,
    //     levels[2]
    // );
    // const articleContent = [
    //     removeTitle(articleLowLevel.choices[0].message.content),
    //     removeTitle(articleMidLevel.choices[0].message.content),
    //     removeTitle(articleHighLevel.choices[0].message.content),
    // ];
    const article = await generateArticles(
        type,
        genre,
        subGenre,
        topic,
        lowLevel,
        midLevel,
        highLevel
    );

    res.status(200).json({
        status: 'success',
        data: {
            article,
            // articleContent,
            // articleLowLevel,
            // articleMidLevel,
            // articleHighLevel,
            // articleContent,
            // mainBody,
            // completions,
            // results,

        }
    });
    // }
});
async function generateArticles(type, genre, subGenre, topic, lowLevel, midLevel, highLevel) {
    let results = [];
    const levels = [
        lowLevel,
        midLevel,
        highLevel
    ];
    for (let i = 0; i < 3; i++) {
        const gradeLevel = levels[i];
        const propmt = type === 'Fiction' ?
            `Please write an article for a fictional story of about ${(90 + 140) * gradeLevel} words in the genre of ${genre} and subgenre of ${subGenre}. The title and concept for the story are ${topic}. Write it to a ${addOrdinalSuffix(gradeLevel)} grade reading level. And get the main body of the article.`
            : `Please write an article for a non-fictional story of about ${(90 + 140) * gradeLevel} words in the genre of ${genre} and subgenre of ${subGenre}. The title and concept for the story are ${topic}. Write it to a ${addOrdinalSuffix(gradeLevel)} grade reading level. And get the main body of the article.`;
        console.log(`article type: ${type} genre: ${genre} subgenre: ${subGenre} topic: ${topic} gradeLevel: ${gradeLevel} grade`);
        console.log('condition: ', type === 'Fiction');

        const article = await generateArticle(
            propmt,
            type,
            genre,
            subGenre,
            topic,
            gradeLevel
        );
        const articleContent = removeTitle(article.choices[0].message.content);
        if (articleContent == null) {
            console.log('articleContent is null: trying again-------------------------------');
            i--;
            continue;
        } else {
            results.push(articleContent);
        }
    }
    return results;
};
async function generateArticle(prompt, type, genre, subGenre, topic, gradeLevel) {
    const wordCount = (90 + 140) * gradeLevel;
    const grade = `${addOrdinalSuffix(gradeLevel)} grade`;
    const article = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: prompt,
            },
            {
                role: 'assistant',
                content: null,
                function_call: {
                    name: 'get_article',
                    arguments: JSON.stringify({
                        type,
                        genre,
                        subGenre,
                        topic,
                        gradeLevel: grade,
                        wordCount: wordCount,
                    })
                }
            },
        ],
        functions: [
            {
                name: 'get_article',
                description: 'Get an article based on type, genre, sub-genre, topic, and level. Follow the word to not more than the word count, get the main body of the article only, and return it',
                parameters: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            description: 'The type of the article, non-fiction and fiction'
                        },
                        genre: {
                            type: 'string',
                            description: 'The genre of the article, e.g. science and technology, history, tales and myths, life and skills, media, teen themes, young themes etc.'
                        },
                        subGenre: {
                            type: 'string',
                            description: 'The sub-genre of the article, e.g. Ocean organisms, Arctic Organisms, Desert Organisms, Prarie Organisms, Festivals, Historical Events, Mythology, Occupations, Fictional Characters, World Literature, Freshwater organisms, Rainforest organisms etc.'
                        },
                        topic: {
                            type: 'string',
                            description: 'The specific topic of the article.'
                        },
                        gradeLevel: {
                            type: 'string',
                            description: 'The grade reading level e.g. 1st grade, 2nd grade, 3rd grade, 4th grade, 5th grade, 6th grade, 7th grade, 8th grade, 9th grade, 10th grade, 11th grade, 12th grade'
                        },
                        wordCount: {
                            type: 'number',
                            description: 'The word count of the article'
                        },
                    },
                    required: [
                        'type',
                        'genre',
                        'subGenre',
                        'topic',
                        'gradeLevel',
                        'wordCount',
                    ]
                }
            }
        ],
        temperature: 1.2,
    });
    const result = article.data;
    return result;
}

exports.test = catchAsync(async (req, res, next) => {
    const inputText = "Here is a short article about dolphins:\n\nTitle: \"The Intelligent Creatures of the Ocean\"\n\nMain Body: Dolphins are highly intelligent and social creatures that inhabit the oceans. They have been known to display advanced problem-solving skills and exhibit complex behaviors. Dolphins are also excellent communicators, using a series of clicks, whistles, and body movements to interact with one another. These remarkable mammals are known for their playful nature and acrobatic displays, often jumping out of the water and riding alongside boats. With their incredible intelligence and unique characteristics, dolphins continue to fascinate scientists and ocean enthusiasts alike.\n\nPlease note that the main body of the article exceeds the requested maximum word count limit."; // Your input text here
    const mainBody = extractMainBody(inputText);
    // const averageFrequency = await getWordFrequency(mainBody);
    // const vocabularyLevels = vocabularyLevelGrader(mainBody);
    // const compressionRatio = calCompressionRatio(mainBody);
    // const frequency = wordfreq.freq(mainBody);
    res.status(200).json({
        status: 'success',
        data: {
            mainBody,
            // compressionRatio,
            // vocabularyLevels,
            // frequency,
            // averageFrequency
        }
    });
});
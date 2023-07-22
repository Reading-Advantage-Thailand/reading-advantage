const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const csvParser = require('csv-parser');

dotenv.config({ path: './config.env' });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// This function is used to add the ordinal suffix to a number
// For example: 1 => 1st, 2 => 2nd
function addOrdinalSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const num = Number(number);
    const lastTwoDigits = num % 100;
    const suffix = suffixes[(lastTwoDigits - 20) % 10] || suffixes[lastTwoDigits] || suffixes[0];
    return num + suffix;
}

// Tbis function is used to generate articles 
async function generateArticles(type, genre, subGenre, topic, lowLevel, midLevel, highLevel) {
    let results = [];
    const levels = [
        lowLevel,
        midLevel,
        highLevel
    ];

    // Generate 3 articles for each level
    for (let i = 0; i < 3; i++) {
        const gradeLevel = levels[i];
        const propmt = type === 'Fiction' ?
            `Please write an article for a fictional story of about ${(90 + 140) * gradeLevel} words in the genre of ${genre} and subgenre of ${subGenre}. The title and concept for the story are ${topic}. Write it to a ${addOrdinalSuffix(gradeLevel)} grade reading level. And get the main body of the article.`
            : `Please write an article for a non-fictional story of about ${(90 + 140) * gradeLevel} words in the genre of ${genre} and subgenre of ${subGenre}. The title and concept for the story are ${topic}. Write it to a ${addOrdinalSuffix(gradeLevel)} grade reading level. And get the main body of the article.`;
        console.log(`article type: ${type} genre: ${genre} subgenre: ${subGenre} topic: ${topic} gradeLevel: ${gradeLevel} grade`);
        console.log('condition: ', type === 'Fiction');

        // Generate the article
        const article = await generateArticle(
            propmt,
            type,
            genre,
            subGenre,
            topic,
            gradeLevel
        );
        const articleContent = article.choices[0].message.content;

        // If the article is null, try again to generate the article for the same level
        // This is because sometimes the article is null
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

// This function is used to generate an article based on the prompt, type, genre, sub-genre, topic, and level
async function generateArticle(prompt, type, genre, subGenre, topic, gradeLevel) {
    const wordCount = (90 + 140) * gradeLevel;
    const grade = `${addOrdinalSuffix(gradeLevel)} grade`;

    // Prompt the GPT-3 to generate the article
    // The article is generated based on the prompt, type, genre, sub-genre, topic, and level
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
                description: 'Get an article based on type, genre, sub-genre, topic, and level. Follow the word to not more than the word count, get the article and title, and return it',
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
        // The temperature is used to control the randomness of the article
        temperature: 1.2,
    });
    const result = article.data;
    return result;
}

// This function is used to generate the articles for the given csv file
(async () => {
    // Load the csv file
    const fileName = '../data/Corrected_Prompts.csv';
    let countRow = 0;
    // The number of rows to read from the csv file.
    // You can change this number to read more rows
    let numberOfRowsToRead = 2
    let csvData = [];
    let results = [];
    const stream = fs.createReadStream(fileName)
        .pipe(csvParser())
        .on('data', (row) => {
            const data = {
                index: countRow,
                type: row['Type'],
                genre: row['Genre'],
                subGenre: row['Sub-genre'],
                topic: row['Topic'],
                lowLevel: row['Low level'],
                midLevel: row['mid level'],
                highLevel: row['high level'],
            }
            csvData.push(data);
        })
        .on('end', async () => {
            console.log('CSV data loaded');

            // Generate the articles for each row in the csv file
            for (let i = 0; i < numberOfRowsToRead; i++) {
                const row = csvData[i];
                console.log('row: ', i);
                const result = await generateArticles(
                    row.type,
                    row.genre,
                    row.subGenre,
                    row.topic,
                    row.lowLevel,
                    row.midLevel,
                    row.highLevel
                );
                results.push({
                    index: i,
                    type: row.type,
                    genre: row.genre,
                    subGenre: row.subGenre,
                    topic: row.topic,
                    articles: result,
                });
            }
            // console.log(results);
            fs.writeFileSync('../data/articles.json', JSON.stringify(results));
            console.log('Articles generated');
        })
})();
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const csvParser = require('csv-parser');

dotenv.config({ path: './config.env' });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
let generatedCount = 0;
function addOrdinalSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const num = Number(number);
    const lastTwoDigits = num % 100;
    const suffix = suffixes[(lastTwoDigits - 20) % 10] || suffixes[lastTwoDigits] || suffixes[0];
    return num + suffix;
}

function removeNewlines(jsonObject) {
    try {
        // Remove '\n\n' occurrences
        jsonObject.content = jsonObject.content.replace(/\n\n/g, ' ');
        // Remove remaining '\n' occurrences
        jsonObject.content = jsonObject.content.replace(/\n/g, ' ');

        return jsonObject;
    } catch (error) {
        console.error('Error removing newlines:', error.message);
        return jsonObject; // Return the original object if an error occurs
    }
}

async function generateArticle(type, genre, subGenre, topic, gradeLevel) {
    const nonFictionPrompt = `Please write non-fiction article of about ${90 + (140 * gradeLevel)} words in the genre of ${genre} and subgenre of ${subGenre}. The topic of the article is ${topic} Write it to a ${addOrdinalSuffix(gradeLevel)} grade reading level.`;
    const fictionPrompt = `Please write a fictional story of about ${90 + (140 * gradeLevel)} words in the genre of ${genre} and subgenre of ${subGenre}. The topic of the story is ${topic}  Write it to a ${addOrdinalSuffix(gradeLevel)} grade reading level.`;
    const prompt = type === 'Fiction' ? fictionPrompt : nonFictionPrompt;
    const temperature = type === 'Fiction' ? 0.5 : 1.2;
    const schema = {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: "The title of the article returned in plain text with no formatting or '\\n' breaks"
            },
            content: {
                type: 'string',
                description: "The content of the article based on the topic, genre, sub-genre, grade level, and word count. Returned in plain text with no formatting, or '\\n\\n' and '\\n' breaks."
            },
        },
        required: [
            'title',
            'content',
        ]
    };

    console.log('prompt:', prompt);
    console.log('is fiction:', type === 'Fiction');

    const reponse = await openai.createChatCompletion({
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
                "name": 'get_article',
                "parameters": schema,
            }
        ],
        function_call: {
            name: 'get_article',
        },
        temperature: temperature,
    })
    const result = JSON.parse(reponse.data.choices[0].message.function_call.arguments);
    const data = {
        title: result.title,
        content: result.content,
        grade: parseInt(gradeLevel),
    }
    // console.log('data:', data);
    const modifiedData = removeNewlines(data);
    console.log('modified:', modifiedData);
    return modifiedData;
}

async function generateArticles(
    type, genre, subGenre, topic, lowLevel, midLevel, highLevel
) {
    const levels = [
        lowLevel,
        midLevel,
        highLevel
    ];
    const results = [];
    for (let i = 0; i < 3; i++) {
        const gradeLevel = levels[i];
        const result = await generateArticle(
            type,
            genre,
            subGenre,
            topic,
            gradeLevel,
        ).then((article) => {
            generatedCount++;
            return article;
        }).catch((error) => {
            console.error('Error generating article:', error.message);
            i--;
        });
        results.push(result);
        console.log('generated article for grade level', gradeLevel);
        console.log('generatedCount:', generatedCount);
    }
    return results;

}
function getRandomNumbers(amount, maxValue) {
    const randomNumbers = [];
    for (let i = 0; i < amount; i++) {
        const randomNumber = Math.floor(Math.random() * (maxValue + 1));
        randomNumbers.push(randomNumber);
    }
    fs.writeFileSync('../data/randomNumbers.json', JSON.stringify(randomNumbers));
    return randomNumbers;
}

async function randomGenerateArticle(csvFile, amount, outputPath) {
    const results = [];
    const csvData = [];
    let ramdomNumbers = [];

    let countRow = 0;
    const stream = fs.createReadStream(csvFile)
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
            ramdomNumbers = getRandomNumbers(amount, csvData.length - 1)
        })
        .on('end', async () => {
            console.log('CSV data loaded');

            // Generate the articles for each row in the csv file
            for (let i = 0; i < ramdomNumbers.length; i++) {
                const row = csvData[ramdomNumbers[i]];
                console.log('csv row:', ramdomNumbers[i]);
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
                    index: ramdomNumbers[i],
                    type: row.type,
                    genre: row.genre,
                    subGenre: row.subGenre,
                    topic: row.topic,
                    articles: result,
                });
                fs.writeFileSync(outputPath, JSON.stringify(results));
                console.log('updated JSON file:', outputPath);
            }
            console.log('articles generated ');
        });
}

async function generateArticlesFromCSV(csvFile, startIndex, endIndex, outputPath) {
    const results = [];
    const csvData = [];

    let countRow = 0;
    const stream = fs.createReadStream(csvFile)
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
            for (let i = startIndex; i <= endIndex; i++) {
                const row = csvData[i];
                console.log('csv row:', i);
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
                fs.writeFileSync(outputPath, JSON.stringify(results));
                console.log('updated JSON file:', outputPath);
            }
            console.log('articles generated ');
        });
}

module.exports = {
    generateArticle,
    generateArticles,
    generateArticlesFromCSV,
    randomGenerateArticle,
};

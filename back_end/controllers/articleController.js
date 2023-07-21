const catchAsync = require("../utils/catchAsync");
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const zlib = require('zlib');
const wordfreq = require('word-freq');
const vocabularyLevelGrader = require('vocabulary-level-grader');

dotenv.config({ path: './config.env' });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function extractMainBody(articleContent) {
    // const mainBodyRegex = /Main Body:\n([\s\S]+)/;
    const mainBodyRegex = /Main Body:(.*)/s;
    const newLineRegex = /\n\n/g;

    const match = mainBodyRegex.exec(articleContent);

    if (match && match[1]) {
        const mainBody = match[1].replace(newLineRegex, ',');
        return mainBody;
    } else {
        return null; // Main body not found in the input text
    }

}

function calCompressionRatio(originalText) {
    const compressedText = zlib.deflateSync(originalText); // Compress the original text
    const originalSize = Buffer.byteLength(originalText); // Calculate the size of the original text in bytes
    const compressedSize = compressedText.length; // Calculate the size of the compressed text in bytes

    const compressionRatio = originalSize / compressedSize;
    return compressionRatio;
}

exports.getArticle = catchAsync(async (req, res, next) => {
    // Extract the required parameters from req.body
    const { type, genre, sub_genre, topic } = req.body;

    // Construct the input for GPT-3.5 based on the provided parameters
    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: `Get me a short article maximum 100 words and title about ${type}, ${genre}, ${sub_genre}, and ${topic}. And I only need the title and main body.`
            },
            {
                role: 'assistant',
                content: null,
                function_call: {
                    name: 'get_article',
                    arguments: JSON.stringify(req.body)
                }
            }
        ],
        functions: [
            {
                name: 'get_article',
                description: 'Get an article based on type, genre, sub-genre, and topic',
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
                        sub_genre: {
                            type: 'string',
                            description: 'The sub-genre of the article, e.g. Ocean organisms, Arctic Organisms, Desert Organisms, Prarie Organisms, Festivals, Historical Events, Mythology, Occupations, Fictional Characters, World Literature, Freshwater organisms, Rainforest organisms etc.'
                        },
                        topic: {
                            type: 'string',
                            description: 'The specific topic of the article.'
                        }
                    },
                    required: [
                        'type',
                        'genre',
                        'sub_genre',
                        'topic'
                    ]
                }
            }
        ],
        // temperature: 0.7, // Adjust the temperature as per your preference (lower values make the response more focused)
        // max_tokens: 200, // Limit the response to a specific number of tokens (adjust as needed)
    });


    console.log("completion: ", completion.data.choices[0]);

    // Extract the article content from the completion response
    const articleContent = completion.data.choices[0].message.content;
    console.log("articleContent: ", articleContent);
    const mainBody = extractMainBody(articleContent);
    if (mainBody != null) {
        console.log("mainBody: ", mainBody);
        const vocabularyLevels = vocabularyLevelGrader(mainBody);
        const compressionRatio = calCompressionRatio(mainBody);
        res.status(200).json({
            status: 'success',
            data: {
                articleContent,
                mainBody,
                compressionRatio,
                vocabularyLevels,
                // averageFrequency,
            }
        });
    } else {
        res.status(200).json({
            status: 'success',
            data: {
                articleContent,
                mainBody,
            }
        });
    }


});

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
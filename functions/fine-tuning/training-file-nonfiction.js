const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const directoryPath = "/Users/may/reading-advantage/data/results/A1/";
const NLPStatsPath = "/Users/may/reading-advantage/data/A1-NLPStats.txt";
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

function readFilesInDirectory(directoryPath, callback) {
    // Read the list of files in the directory
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }
      // Iterate through the files
      files.forEach((file) => {
        // Construct the full path of the file
        const filePath = path.join(directoryPath, file);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return;
            }
            const jsonData = JSON.parse(data);
            if (jsonData.type === 'non-fiction' || jsonData.type === 'Non-Fiction') {
                callback(jsonData, file);
            } 
    
        }) 
      });
    });
  }
//   readFilesInDirectory(directoryPath);

async function readContentInStats (NLPStatsPath, callback) {
   const filePath = path.join(NLPStatsPath);

   const fileContent = fs.readFileSync(filePath, 'utf8');
  // Split the content into lines
const lines = fileContent.split('\n');

// Iterate through each line
lines.forEach(line => {
    // Use regular expressions to extract filename and word count
    const match = line.match(/^(.+): Word Count = (\d+), Average Words per Sentence = (\d+(\.\d+)?),/);

    if (match) {
        const fileName = match[1].trim();
        const wordCount = parseInt(match[2], 10);
        const wordsPerSentence = parseFloat(match[3]);
       
            callback(fileName, wordCount, wordsPerSentence);
    }
});
   }
  
//   readContentInStats(NLPStatsPath);
  
  async function trainningFileFiction ()  {  
      readFilesInDirectory(directoryPath, (jsonData, file) => {
       readContentInStats(NLPStatsPath, (fileName, wordCount, wordsPerSentence) => {
        const getFileExtension = (filename, file) => {
            const textFileName = filename.split('.').shift();
            const jsonFileName = file.split('-').shift();

            if (textFileName === jsonFileName) {
                messages =  [
                                 {
                                     role: 'system',
                                     content:
                     
                                     `You are an expert in second language acquisition and leveled reading passage writing. You will write A1 passages for readers with the following abilities for CEFR Level A1 
                                     Understand short, simple messages on postcards.
                                     Understand short, simple messages sent via social media or e-mail (e.g. proposing what to do, when and where to meet).
                                     Recognise familiar names, words/signs and very basic phrases on simple notices in the most common everyday situations.
                                     Understand store guides (information on which floors departments are on) and directions (e.g. where to find toilets).
                                     Understand basic hotel information (e.g. times when meals are served).
                                     Find and understand simple, important information in advertisements, programmes for special events, leaflets and brochures (e.g. what is proposed, costs, the date and place of the event, departure times).
                                     Get an idea of the content of simpler informational material and short, simple descriptions, especially if there is visual support.
                                     Understand short texts on subjects of personal interest (e.g. news flashes about sports, music, travel or stories) composed in very simple language and supported by illustrations and pictures.
                                     Follow short, simple directions (e.g. to go from X to Y).
                                     Understand short, illustrated narratives about everyday activities described in simple words.
                                     Understand in outline short texts in illustrated stories, provided the images help them to guess at a lot of the content.
                                     Understand very short, simple texts a single phrase at a time, picking up familiar names, words and basic phrases and rereading as required.`
                                 },
                                 {
                                     role: 'user',
                                     content: `Write a short, nonfiction article within the ${jsonData.genre} genre and the ${jsonData.subGenre} subgenre. This article is meant for readers at the A1 English proficiency level, according to the CEFR guidelines.

                                     Key Guidelines:
                                     1. **Length:** The article should be about ${wordCount} words, keeping it brief and to the point.
                                     2. **Sentence Structure:** Limit the average to ${wordsPerSentence} words per sentence. Use very basic sentence structures, predominantly simple present tense, with straightforward subject-verb-object constructs.
                                     3. **Vocabulary:** Use elementary vocabulary, consisting mostly of common, everyday words. The language should be highly repetitive, focusing on words and phrases related to daily life and closely tied to the {subgenre}. Avoid any idiomatic expressions, slang, or abstract concepts.
                                     4. **Content:** Stick to very concrete and familiar topics, with a focus on naming and describing in simple terms. Avoid any form of abstraction or complexity.
                                     5. **Style and Tone:** Keep the style extremely simple, clear, and direct. The tone should be friendly and encouraging, with an emphasis on positivity and support for the beginner reader.
                                     6. **Engagement:** Use very basic questions or direct instructions to engage the reader.
                                     7. **References:** Avoid using references. If necessary, any reference to external content should be made extremely straightforward and directly related to the reader's immediate experience.
                                     
                                     The article's structure should be very basic, with a clear and direct introduction, a body made up of short, simple sections or bullet points, and a clear conclusion that reiterates the main points using different words.`
                                 },
                                 {
                                     role: 'assistant',
                                     content: {
                                         title: jsonData.title,
                                         content: jsonData.story,
                                         summary: jsonData.summary,
                                         image: jsonData.image,
                                     }
                                 }
                             ];
                const jsonDataFinalPrompt = {
                                model: 'gpt-3.5-turbo',
                                messages: `${JSON.stringify(messages)}`,
                                functions: [
                                    {
                                        'name': 'get_article',
                                        'parameters': {
                                            type: 'object',
                                            properties: {
                                                title: {
                                                    type: 'string',
                                                    description: "The title of the article returned in plain text with no formatting or '\\n' breaks"
                                                },
                                                content: {
                                                    type: 'string',
                                                    description: "The content of the story based on the topic, genre, sub-genre, CEFR Level, and word count. Returned in plain text with no formatting, or '\\n\\n' and '\\n' breaks."
                                                },
                                                summary: {
                                                    type: 'string',
                                                    description: "A one-sentence summary of the content without spoilers."
                                                },
                                                image: {
                                                    type: 'string',
                                                    description: "The desription of an image which can be displayed alongside the story."
                                                },
                                            },
                                            required: [
                                                'title',
                                                'content',
                                                'summary',
                                                'image',
                                            ]
                                        }
                                    }
                                ],
                                function_call: {
                                    name: 'get_article',
                                },
                                temperature: 1,
                            };
          
                             // save it to json file 
                                const dir = '../data/training-message/A1-non-fiction';
                                fs.mkdirSync(dir, { recursive: true });

                                const jsonContent = JSON.stringify(jsonDataFinalPrompt);
                                fs.writeFile(path.join(dir, `${textFileName}.json`), jsonContent, 'utf8', (err) => {
                                    if (err) {
                                        console.error("Error writing file:", err);
                                        return;
                                    }
                                    
                                    console.log(`File ${textFileName}.json is saved.`);
                                });
                            
            }
        };
        getFileExtension(fileName, file);
    }); 
    
   });
    };
       
    
trainningFileFiction();
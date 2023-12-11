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
            if (jsonData.type === 'Fiction' || jsonData.type === 'fiction') {
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
                messages =  
                              {"messages":  [ {
                                     role: 'system',
                                     content:
                     
                                     `You are an expert in second language acquisition and leveled reading passage writing. You will write A1 passages for readers with the following abilities for CEFR Level A1
                                     Understand very short, simple texts a single phrase at a time, picking up familiar names, words and basic phrases and rereading as required.
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
                                     Understand in outline short texts in illustrated stories, provided the images help them to guess at a lot of the content.`
                                 },
                                 {
                                     role: 'user',
                                     content: `Write a short and very simple fiction story in the ${jsonData.genre} genre, specifically tailored to the ${jsonData.subGenre} subgenre, for readers at the A1 level of the Common European Framework of Reference for Languages (CEFR).\n
                                 Key Guidelines:\n
                                 1. **Length:** The story should be approximately ${wordCount} words.\n
                                 2. **Sentence Structure:** Use very short sentences, with an average of around ${wordsPerSentence} words per sentence. The sentence structure should be basic and repetitive, using simple present tense and common, everyday language.\n
                                 3. **Vocabulary:** Stick to a limited vocabulary, comprising basic nouns, verbs, and adjectives familiar to beginners. Avoid any complex or abstract words. Repeat key vocabulary to aid understanding and memorization.\n
                                 4. **Content:** Focus on concrete, relatable themes and simple, linear storylines. Characters should be straightforward, and their actions or experiences should be described using simple and clear language.\n
                                 5. **Style and Tone:** Keep the style very simple and the tone friendly and encouraging. The narrative should be engaging but not confusing or overwhelming for a beginner.\n
                                 6. **Engagement:** Use basic story elements to keep the narrative interesting. This can include everyday events, simple actions, and familiar settings. Illustrations or images can be helpful to support the text.\n
                                 7. **References:** Avoid any references or cultural idioms that require prior knowledge or cultural understanding beyond that of a beginner.\n
                                 Begin with a clear, simple setting and characters, followed by a predictable sequence of events, and conclude with a straightforward ending that reinforces the main points of the story.\n
                                 After you complete the story, write a title, a one-sentence summary (without spoilers) and a description of an image to be displayed alongside the story.`
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
                                ]}
                             ;
             
                             // save it to json file 
                                const dir = '../data/training-message/A1-fiction';
                                fs.mkdirSync(dir, { recursive: true });

                                const jsonContent = JSON.stringify(messages);
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
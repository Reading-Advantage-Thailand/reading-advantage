// This runner using for combined all articles using before training (json to jsonl)
import fs from "fs";
import { Article } from "../types";

interface Stats {
    fileName: string;
    wordCount: number;
    avgWordsPerSentence: number;
    avgCharsPerWord: number;
}
function parseFileMetrics(filePath: string): { [key: string]: Stats } {
    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n').slice(1);  // Skip the first line

    let fileMetrics: { [key: string]: Stats } = {};

    for (let line of lines) {
        if (line.startsWith('Combined Average Metrics Across All Files')) {
            // Handle the combined metrics here if needed
            continue;
        }

        let parts = line.split(': ');
        if (parts.length < 2) {
            continue;  // Skip lines without a ':'
        }

        let [fileName, metrics] = parts;
        let stats: Stats = {
            fileName,
            wordCount: 0,
            avgWordsPerSentence: 0,
            avgCharsPerWord: 0
        };
        for (let metric of metrics.split(', ')) {
            // console.log('metric before split:', metric);
            let [metricName, metricValue] = metric.split(' = ');
            // console.log('value', metricName, metricValue);
            switch (metricName) {
                case 'Word Count':
                    stats.wordCount = parseFloat(metricValue);
                    break;
                case 'Average Words per Sentence':
                    stats.avgWordsPerSentence = parseFloat(metricValue);
                    break;
                case 'Average Characters per Word':
                    stats.avgCharsPerWord = parseFloat(metricValue);
                    break;
                default:
                    console.log('Unmatched metric name:', metricName);
                    break;
            }
        }
        fileMetrics[fileName] = stats;
    }

    return fileMetrics;
}

interface Message {
    role: "system" | "user" | "assistant";
    content: string | { title: string; content: string; summary: string; image_description: string };
}

async function run() {
    // Read from the folder
    const level = "A2";
    const statsFilePath = `/Users/passakorn/Coding/reading-advantage/data/A2-NLPstats.txt`;
    const articlesFolderPath = `${process.cwd()}/data/${level}_nonfiction`;
    const articleJSONfiles = fs.readdirSync(articlesFolderPath);
    const fileMetrics = parseFileMetrics(statsFilePath);
    const systemPrompt = fs.readFileSync(`${process.cwd()}/data/prompts/${level}_system_prompt.txt`, "utf8");

    const startIndex = 0;
    const endIndex = articleJSONfiles.length;
    // const endIndex = 2;

    const messages: { messages: Message[] }[] = [];
    // Combine all articles
    for (let i = startIndex; i < endIndex; i++) {
        // Read the article JSON file
        const fileName = articleJSONfiles[i];
        const fileNameWithoutExtension = fileName.split(".")[0];
        console.log("Processing file:", fileName);

        // Parse the article JSON file
        const article = JSON.parse(
            fs.readFileSync(`${articlesFolderPath}/${fileName}`, "utf8")
        ) as Article;

        const stats = fileMetrics[`${fileNameWithoutExtension}.txt`];
        const content = {
            title: article.title,
            content: article.passage,
            summary: article.summary,
            image_description: article.image_description,
        }
        const message: { messages: Message[] } = {
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Write a ${stats.wordCount}-word nonfiction article in the ${article.genre} genre and the ${article.subgenre} subgenre on the topic of ${article.title}. This article is meant for readers at the A2 CEFR language proficiency level.`,
                },
                {
                    role: "assistant",
                    content: JSON.stringify(content),
                }
            ]
        }

        messages.push(message);
    }
    // Write the combined articles to a JSONL file
    fs.writeFileSync(
        `${process.cwd()}/data/${level}_nonfiction_combined.jsonl`,
        messages.map((message) => JSON.stringify(message)).join("\n")
    );
}

run();

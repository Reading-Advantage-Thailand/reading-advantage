import fetch from "node-fetch";
import { Octokit } from "@octokit/core";
import { synthetic_data_generator } from "../generators/synthetic_data_generator";
import fs from "fs";

const octokit = new Octokit();

interface FileData {
    fileName: string;
    content: string;
}

interface ReponseOctokit {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

// Function to fetch text files and their content from a GitHub repository
async function fetchTextFilesAndContent(
    owner: string,
    repo: string,
    path: string
): Promise<FileData[]> {
    try {
        // Fetch the contents of the specified directory from the GitHub repository
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner: owner,
                repo: repo,
                path: path,
            }
        );

        // Filter out text files from the response data
        const textFiles = (response.data as ReponseOctokit[]).filter(
            (file: ReponseOctokit) =>
                file.type === "file" && file.name.endsWith(".txt")
        );

        // Fetch content for each text file and store it along with the file name
        const filesWithData = await Promise.all(
            textFiles.map(async (file: any) => {
                const contentResponse = await fetch(file.download_url);
                const content = await contentResponse.text();
                return { fileName: file.name, content: content } as FileData;
            })
        );

        return filesWithData;
    } catch (error) {
        console.error("Error fetching text files and content:", error);
        return [];
    }
}

// Function to run the fetching process
async function run() {
    const owner = "AMontgomerie";
    const repo = "CEFR-English-Level-Predictor";
    const level = "B2";
    const directoryPath = "data/" + level;
    const startIndex = 0;
    let endIndex = 0;

    try {
        // Fetch text files and their content
        const filesWithData = await fetchTextFilesAndContent(
            owner,
            repo,
            directoryPath
        );

        if (filesWithData.length === 0) {
            console.log("No text files found in the specified directory.");
            return;
        }
        endIndex = filesWithData.length;

        // Check output folder exists
        if (!fs.existsSync(`./data/${level}_fiction`)) {
            console.log("creating folder:", `./data/${level}_fiction`);
            fs.mkdirSync(`./data/${level}_fiction`);
        }
        if (!fs.existsSync(`./data/${level}_nonfiction`)) {
            console.log("creating folder:", `./data/${level}_nonfiction`);
            fs.mkdirSync(`./data/${level}_nonfiction`);
        }

        // Display file name and content for each text file
        // filesWithData.forEach((fileData: FileData) => {
        //     console.log("File Name:", fileData.fileName);
        //     console.log("Content:", fileData.content);
        // });

        // Generate synthetic data based on the content of the text files
        // For each file, you can call the synthetic_data_generator function
        // and pass the content of the file as the story parameter
        let errorCount = 0;
        let successCount = 0;
        let nonFictionCount = 0;
        let fictionCount = 0;
        let logs: { index: number; fileName: string; error: string }[] = [];

        console.log(
            "running synthetic data generation...",
            filesWithData.length,
            "files"
        );
        for (let i = startIndex; i < endIndex; i++) {
            const fileData = filesWithData[i];
            // console.log("File Name:", fileData.fileName);
            // console.log("Content:", fileData.content);

            // Call the synthetic_data_generator function
            // with the content of the file as the story parameter
            try {
                const syntheticData = await synthetic_data_generator(fileData.content);
                // console.log("Synthetic Data:", syntheticData);
                const fileName = fileData.fileName.split(".")[0];
                // fs.writeFileSync(`./data/${level}/${fileName}.json`, JSON.stringify(syntheticData, null, 2));
                console.log(
                    "type:",
                    syntheticData?.type,
                    "fileName:",
                    fileName,
                    "index:",
                    i
                );
                if (syntheticData?.type === "fiction") {
                    fs.writeFileSync(
                        `./data/${level}_fiction/${fileName}.json`,
                        JSON.stringify(syntheticData, null, 2)
                    );
                    fictionCount++;
                } else {
                    fs.writeFileSync(
                        `./data/${level}_nonfiction/${fileName}.json`,
                        JSON.stringify(syntheticData, null, 2)
                    );
                    nonFictionCount++;
                }
                successCount++;
            } catch (error) {
                console.log("index:", i, "Error generating synthetic data:", error);

                // Log the error and continue with the next file
                errorCount++;
                logs.push({
                    index: i,
                    fileName: fileData.fileName,
                    error: error + "",
                });

                // regenerating synthetic data
                i--;
            }
        }
        console.log("Success Count:", successCount);
        console.log("Fiction Count:", fictionCount);
        console.log("Non-Fiction Count:", nonFictionCount);

        console.log("Error Count:", errorCount);
        console.log("Logs:", logs);

        // Write error logs to a file
        if (logs.length > 0) {
            fs.writeFileSync(
                `./data/logs/${level}_error_logs.json`,
                JSON.stringify(logs, null, 2)
            );
        }

        // Write the logs to a file
        const logsData = {
            filesLength: filesWithData.length,
            successCount,
            fictionCount,
            nonFictionCount,
            errorCount,
            logs,
        };
        fs.writeFileSync(
            `./data/logs/${level}_logs.json`,
            JSON.stringify(logsData, null, 2)
        );
    } catch (error) {
        console.error("Error:", error);
    }
}

run();

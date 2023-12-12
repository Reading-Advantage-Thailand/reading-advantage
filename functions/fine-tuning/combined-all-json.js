const fs = require('fs').promises;
const path = require('path');
const directoryPath = "/Users/may/reading-advantage/data/training-message/A1-non-fiction/";

async function combineJsonFiles(directoryPath) {
    let combinedData = [];

    try {
        const files = await fs.readdir(directoryPath);

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const data = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(data);
            combinedData.push(jsonData);
        }

        // return combinedData;
        const jsonContent = JSON.stringify(combinedData);
        await fs.writeFile('../data/combined-json-data/A1-non-fiction.json', jsonContent, 'utf8');
        console.log('File combined.json is saved.');

    } catch (err) {
        console.error("Error:", err);
    }
}

combineJsonFiles(directoryPath)
    .catch(err => console.error(err));




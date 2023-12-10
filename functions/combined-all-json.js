const fs = require('fs');
const path = require('path');
const directoryPath = "/Users/may/reading-advantage/data/trainning-message/";

let combinedData = [];

// Assume directoryPath is the path to the directory containing the JSON files
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return;
            }

            const jsonData = JSON.parse(data);
            combinedData.push(jsonData);
        });
    });

});

// Save combined data to a single JSON file
const jsonContent = JSON.stringify(combinedData);
fs.writeFile('../data/combined-json-data/A1.json', jsonContent, 'utf8', (err) => {
    if (err) {
        console.error("Error writing file:", err);
        return;
    }

    console.log('File combined.json is saved.');
});




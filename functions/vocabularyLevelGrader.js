const vocabularyLevelGrader = require('vocabulary-level-grader');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const fileName = '../articles-CEFR2.csv';
const outputFileName = 'articles-CEFR3.csv';
const data = [];

fs.createReadStream(fileName)
    .pipe(csvParser())
    .on('data', (row) => {
        const articleText = row['article text'];
        console.log('Article Text:', articleText);
        console.log('---------------------------------------');
        const result = vocabularyLevelGrader(articleText).meta.levels;

        // Map the result to the desired format
        const mappedResult = {
            A1: result.A1,
            A2: result.A2 - result.A1,
            B1: result.B1 - result.A2,
            B2: result.B2 - result.B1,
            C1: result.C1 - result.B2,
            C2: result.C2 - result.C1,
        };

        console.log('Mapped Result:', mappedResult);
        row['vocabulary level grader scores'] = JSON.stringify(mappedResult);
        data.push(row);
    })
    .on('end', () => {
        console.log('CSV data processed successfully');

        // Save the modified data to the new CSV file
        const csvWriter = createCsvWriter({
            path: path.join(__dirname, outputFileName),
            header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
        });

        csvWriter.writeRecords(data).then(() => {
            console.log(`Data saved to ${outputFileName}`);
        });
    });

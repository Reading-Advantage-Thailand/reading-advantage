const readability = require('text-readability');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
// results folder contains 50 json file with included text and articles information
// const resultsPath = '../data/results/A1/';
// folder name A1, A2, B1, B2, C1, C2 all are included txt files
const baselineGSE = {
    'A0': 15,
    'A0+': 20,
    'A1': 25,
    'A1+': 30,
    'A2': 36,
    'A2+': 43,
    'B1': 51,
    'B1+': 58,
    'B2': 65,
    'B2+': 71,
    'C1': 78,
    'C1+': 83,
    'C2': 88,
};

const cefrLevels = {
    'A0': [],
    'A0+': [],
    'A1': [],
    'A1+': [],
    'A2': [],
    'A2+': [],
    'B1': [],
    'B1+': [],
    'B2': [],
    'B2+': [],
    'C1': [],
    'C1+': [],
    'C2': [],
};



async function fetchCEFRScores(article) {
    try {
        const response = await axios.post('https://cefr-english-predictor-api-hxamzdhgwa-et.a.run.app/predict', {
            texts: [article],
        });
        console.log('CEFR scores:', response.data[0].scores)

        return response.data[0];
    } catch (error) {
        console.error('Error fetching CEFR scores:', error);
        return null;
    }
}


// async main
async function main() {
    const resultsPath = '../../CEFR-English-Level-Predictor-api/data/';
    const articleResults = [];
    // loop through all folders in results folder
    const folders = fs.readdirSync(resultsPath);
    const exceptFolders = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (let i = 0; i < folders.length; i++) {
        if (folders[i] !== 'A1' && folders[i] !== 'A2' && folders[i] !== 'B1' && folders[i] !== 'B2' && folders[i] !== 'C1' && folders[i] !== 'C2') {
            continue;
        }
        const files = fs.readdirSync(path.join(resultsPath, folders[i]));
        console.log('files:', files);
        for (let j = 0; j < files.length; j++) {
            // read txt file and get text
            const article = fs.readFileSync(path.join(resultsPath, folders[i], files[j]), 'utf8');
            // console.log('article:', article);
            const textStandard = readability.textStandard(article);
            console.log('textStandard:', textStandard);
            const textStandartFloat = readability.textStandard(article, true);
            console.log('textStandart float:', textStandartFloat);
            const CEFRScores = await fetchCEFRScores(article);
            console.log(CEFRScores);

            // use level from CEFRScores
            const level = CEFRScores.level;
            console.log('level:', level);
            cefrLevels[level].push(textStandartFloat);
            console.log('cefrLevels:', cefrLevels);

            //update articleResults
            articleResults.push({
                story: article,
                textStandard: textStandard,
                textStandartFloat: textStandartFloat,
                CEFRScores: CEFRScores.scores,
                level: level,
            });
        }

        // calculate mean and standard deviation for each level
        const means = {};
        const sds = {};
        for (const level in cefrLevels) {
            if (cefrLevels[level].length > 0) {
                const mean = calculateMean(cefrLevels[level]);
                const sd = calculateSD(cefrLevels[level], mean);
                means[level] = mean;
                sds[level] = sd;
                console.log(`Level ${level}:`);
                console.log(`  Mean: ${mean}`);
                console.log(`  Standard Deviation: ${sd}`);
            }
        }
        cefrLevels.means = means;
        cefrLevels.sds = sds;
        // write results to file
        fs.writeFileSync('results2.json', JSON.stringify(articleResults, null, 2));
        fs.writeFileSync('cefrLevels2.json', JSON.stringify(cefrLevels, null, 2));
    }
    // for (let i = 0; i < files.length; i++) {
    //     const article = JSON.parse(fs.readFileSync(path.join(resultsPath, files[i])));
    //     const textStandard = readability.textStandard(article.story);
    //     console.log('textStandard:', textStandard);
    //     const textStandartFloat = readability.textStandard(article.story, true);
    //     console.log('textStandart float:', textStandartFloat);
    //     const CEFRScores = await fetchCEFRScores(article.story);
    //     console.log(CEFRScores);

    //     // use level from CEFRScores
    //     const level = CEFRScores.level;
    //     console.log('level:', level);
    //     cefrLevels[level].push(textStandartFloat);
    //     console.log('cefrLevels:', cefrLevels);

    //     //update articleResults
    //     articleResults.push({
    //         title: article.title,
    //         type: article.type,
    //         genre: article.genre,
    //         subGenre: article.subGenre,
    //         story: article.story,
    //         summary: article.summary,
    //         image: article.image,
    //         textStandard: textStandard,
    //         textStandartFloat: textStandartFloat,
    //         CEFRScores: CEFRScores.scores,
    //         level: level,
    //     });
    // }
    // // calculate mean and standard deviation for each level
    // // example array
    // // cefrLevels: {
    // //     A0: [],
    // //     'A0+': [],
    // //     A1: [
    // //       1, 3, 1, 4, 2,
    // //       5, 3, 4, 1, 4
    // //     ],
    // //     'A1+': [],
    // //     A2: [],
    // //     'A2+': [],
    // //     B1: [],
    // //     'B1+': [],
    // //     B2: [],
    // //     'B2+': [],
    // //     C1: [],
    // //     'C1+': [],
    // //     C2: []
    // //   }
    // // Calculate mean and standard deviation for each level
    // const means = {};
    // const sds = {};
    // for (const level in cefrLevels) {
    //     if (cefrLevels[level].length > 0) {
    //         const mean = calculateMean(cefrLevels[level]);
    //         const sd = calculateSD(cefrLevels[level], mean);
    //         means[level] = mean;
    //         sds[level] = sd;
    //         console.log(`Level ${level}:`);
    //         console.log(`  Mean: ${mean}`);
    //         console.log(`  Standard Deviation: ${sd}`);
    //     }
    // }
    // cefrLevels.means = means;
    // cefrLevels.sds = sds;
    // // write results to file
    // fs.writeFileSync('results.json', JSON.stringify(articleResults, null, 2));
    // fs.writeFileSync('cefrLevels.json', JSON.stringify(cefrLevels, null, 2));
}

// Function to calculate mean
function calculateMean(data) {
    const sum = data.reduce((acc, value) => acc + value, 0);
    return sum / data.length;
}

// Function to calculate standard deviation
function calculateSD(data, mean) {
    const squaredDifferences = data.map(value => Math.pow(value - mean, 2));
    const sumSquaredDifferences = squaredDifferences.reduce((acc, value) => acc + value, 0);
    const variance = sumSquaredDifferences / data.length;
    return Math.sqrt(variance);
}

// Function to calculate z-score
function calculateZScore(value, mean, sd) {
    return (value - mean) / sd;
}

main();
const readabilityCalculator = require('./readabilityCalculator'); // Adjust the path based on your project's directory structure
const fs = require('fs');
const printFullWidthLine = require('./utils/printLine');


(async () => {
    let jsonData = fs.readFileSync('../data/articles_random_5.json');
    let articleArr = JSON.parse(jsonData);
    let updatedArticleArr = [];
    let max = 0;
    let gradeAtMax = 0;
    let min = 100;
    let gradeAtMin = 0;
    let maxCalc = {
        sentenceCount: 0,
        wordCount: 0,
        characterCount: 0,
    }
    let minCalc = {
        sentenceCount: 0,
        wordCount: 0,
        characterCount: 0,
    }
    let range = {
        0: 0, //0-9
        10: 0, //10-19
        20: 0, //20-29
        30: 0, //30-39
        40: 0, //40-49
        50: 0, //50-59
        60: 0, //60-69
        70: 0, //70-79
        80: 0, //80-89
        90: 0, //90-99
    }
    let count = 0;

    console.log('JSON articles data:', articleArr.length);
    for (let i = 0; i < articleArr.length; i++) {
        //remove null value in array
        let modifiedArticles = articleArr[i].articles.filter(function (el) {
            return el != null;
        });
        let articleResult = [];
        for (let j = 0; j < modifiedArticles.length; j++) {
            const article = modifiedArticles[j];
            console.log(article.title);
            const { sentenceCount, wordCount, characterCount } = readabilityCalculator.calculateArticleStats(article.content);
            console.log('title:', article.title);
            // console.log('sentenceCount:', sentenceCount);
            // console.log('wordCount:', wordCount);
            // console.log('charCount:', characterCount);
            const ari = await readabilityCalculator.calculateReadabilityIndex(sentenceCount, wordCount, characterCount);
            console.log('ari:', ari);
            const cefrScores = await readabilityCalculator.fetchCEFRScores(article.content);
            // console.log('cefr scores:', cefrScores);
            const level = readabilityCalculator.calculateReadabilityLevel(ari, cefrScores.scores);
            console.log('level:', level);
            article.ari = ari;
            article.cefr = cefrScores.scores;
            article.cefrLevel = cefrScores.level;
            article.raLevel = level;
            console.log('article:', article);
            articleResult.push({
                title: article.title,
                content: article.content,
                ari: ari,
                cefrScores: cefrScores.scores,
                cefrLevel: cefrScores.level,
                raLevel: level,
                grade: article.grade,
                type: articleArr[i].type,
                genre: articleArr[i].genre,
                subGenre: articleArr[i].subGenre,
                topic: articleArr[i].topic,
            });
            count++;
            console.log('count:', count);
            printFullWidthLine();

            //calculate max and min
            if (level > max) {
                max = level;
                gradeAtMax = article.grade;
                maxCalc.sentenceCount = sentenceCount;
                maxCalc.wordCount = wordCount;
                maxCalc.characterCount = characterCount;
            }
            if (level < min) {
                min = level;
                gradeAtMin = article.grade;
                minCalc.sentenceCount = sentenceCount;
                minCalc.wordCount = wordCount;
                minCalc.characterCount = characterCount;
            }
            //calculate range
            if (level >= 0 && level <= 9) {
                range[0]++;
            }
            if (level >= 10 && level <= 19) {
                range[10]++;
            }
            if (level >= 20 && level <= 29) {
                range[20]++;
            }
            if (level >= 30 && level <= 39) {
                range[30]++;
            }
            if (level >= 40 && level <= 49) {
                range[40]++;
            }
            if (level >= 50 && level <= 59) {
                range[50]++;
            }
            if (level >= 60 && level <= 69) {
                range[60]++;
            }
            if (level >= 70 && level <= 79) {
                range[70]++;
            }
            if (level >= 80 && level <= 89) {
                range[80]++;
            }
            if (level >= 90 && level <= 99) {
                range[90]++;
            }
        }
        for (let k = 0; k < articleResult.length; k++) {
            updatedArticleArr.push(articleResult[k]);
        }
    }
    printFullWidthLine();
    console.log('max:', max);
    console.log('gradeAtMax:', gradeAtMax);
    console.log('maxCalc:', maxCalc);
    console.log('min:', min);
    console.log('gradeAtMin:', gradeAtMin);
    console.log('minCalc:', minCalc);
    console.log('range:', range);
    console.log('updated articles:', updatedArticleArr.length);
    fs.writeFileSync('../data/articles_random_updated7.json', JSON.stringify(updatedArticleArr));
})();
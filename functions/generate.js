const { generateArticle, generateArticles, generateArticlesFromCSV, randomGenerateArticle } = require('./generateArticle');

(async () => {
    const csvFilePath = '../data/Corrected_Prompts.csv';
    const startIndex = 10;
    const endIndex = 14;
    const ramdomAmount = 500;
    const outputPath = '../data/articles-test2.json';

    await randomGenerateArticle(
        csvFilePath,
        ramdomAmount,
        '../data/articles_random_5.json'
    );
    // await generateArticlesFromCSV(
    //     csvFilePath,
    //     startIndex,
    //     endIndex,
    //     outputPath
    // );
})();

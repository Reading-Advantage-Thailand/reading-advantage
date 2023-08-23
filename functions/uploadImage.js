const { Storage } = require('@google-cloud/storage');
const path = require('path');
const serviceAccount = require('./service_account_key.json');
const storage = new Storage({
    projectId: 'reading-advantage',
    // keyFilename: '../data/img.png',
    credentials: serviceAccount,
});

// async function uploadImage(filePath, fileName) {
//     try {
//         await storage.bucket('article-images').upload(filePath, {
//             destination: `images/${fileName}`,
//             gzip: true,
//             metadata: {
//                 cacheControl: 'public, max-age=31536000',
//             },
//         });
//         console.log(`${filePath} uploaded to ${bucketName}.`);
//     } catch (error) {
//         console.error('ERROR:', error);
//     }
// }

// main
(async () => {
    // let count = 0;
    // storage.getBuckets().then(x => console.log(x));

    // get json file
    const articleJson = require('./article_images_final.json');
    const basePath = '../data/article-images/';
    const startIndex = 1093;
    // const endIndex = 1500;
    const endIndex = articleJson.length;

    const results = [];
    // updalod images
    for (let i = startIndex; i < endIndex; i++) {
        console.log('index:', i);
        const article = articleJson[i];
        const imageName = article.imageName;
        const imagePath = path.join(basePath, imageName);
        console.log('imagePath:', imagePath);

        // upload file
        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .upload(imagePath, {
                destination: `article-images/${imageName}`,
            });
        console.log('uploaded:', imageName);
        // update public access
        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .file(`article-images/${imageName}`)
            .makePublic();
        console.log('updated public access:', imageName);

    }
    console.log('done');

})();
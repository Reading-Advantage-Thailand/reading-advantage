const axios = require('axios');
const fs = require('fs');
const Tokenizer = require('sentence-tokenizer');
const dotenv = require('dotenv');
const base64 = require('base64-js');

dotenv.config();

const splitToSentences = (article) => {
    const tokenizer = new Tokenizer("Chuck");
    tokenizer.setEntry(article);
    const sentences = tokenizer.getSentences();

    let ssml = "<speak>";
    sentences.forEach((sentence, i) => {
        ssml += `<s><mark name='sentence${i + 1}'/>${sentence}</s>`;
    });
    ssml += "</speak>";

    return ssml;
};

const generateAudio = async (articleContent) => {
    const baseUrl = "https://texttospeech.googleapis.com";
    const ssml = splitToSentences(articleContent);

    try {
        const response = await axios.post(`${baseUrl}/v1beta1/text:synthesize`, {
            input: {
                ssml: ssml
            },
            voice: {
                languageCode: "en-US",
                name: "en-US-Neural2-C",
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "pitch": 0,
                "speakingRate": 1
            },
            "enableTimePointing": [
                "SSML_MARK"
            ],
        }, {
            params: {
                key: process.env.GOOGLE_API_KEY,
            },
        });

        const audioContent = response.data;
        return audioContent;
    } catch (error) {
        console.log(error);
        return {
            audioContent: null,
            timepoints: null,
        };
    }
};

(async () => {
    const articlePath = fs.readFileSync('../data/articles_firestore.json');
    const articles = JSON.parse(articlePath);

    let result = [];
    let errorCount = 0;
    let errorResult = [];

    for (let i = 160; i < articles.length; i++) {
        console.log(i);
        const article = articles[i];
        const articleContent = article.content;
        console.log('Article ID:', article.docId);

        const audioResponse = await generateAudio(articleContent);

        if (!audioResponse.audioContent) {
            errorCount++;
            i++;
            errorResult.push(article);
            fs.writeFileSync('../data/articles_error.json', JSON.stringify(errorResult));
        } else {
            const mp3Json = audioResponse.audioContent;
            const mp3 = base64.toByteArray(mp3Json);
            fs.writeFileSync(`../data/audios/${article.docId}.mp3`, mp3);

            result.push({
                ...article,
                timepoints: audioResponse.timepoints,
            });

            console.log('Error Count:', errorCount);
            fs.writeFileSync('../data/articles_firestore_with_audio_2.json', JSON.stringify(result));
            console.log('Updated JSON file');
        }
    }
})();

# Unleash Your Language Potential with Reading Advantage - Where AI Meets Extensive Reading

## Introduction:
Welcome to Reading Advantage, an innovative platform that seamlessly blends the power of extensive reading with cutting-edge AI technology to supercharge your language learning journey. As passionate language learners ourselves, we understand that mastering a new language requires personalized guidance and engaging experiences. That's why we've designed Reading Advantage to offer a holistic approach, combining extensive reading, comprehension assistance, writing practice, and speaking accuracy support – all in one place.

## The Magic of Extensive Reading and AI:
Extensive reading forms the cornerstone of our approach to language acquisition. Research has shown that this method surpasses conventional vocabulary and grammar instruction in fostering language development. By immersing yourself in a diverse array of articles and stories at your proficiency level, you'll experience an array of benefits, including:

1. **Rapid Progress and Fluency:**
   Through regular extensive reading practice, you'll notice remarkable progress in your language skills. AI-powered comprehension support ensures you understand the material thoroughly, enhancing your fluency with every turn of the page.

2. **Contextual Vocabulary Building:**
   AI, like our intelligent ChatGPT, assists you in uncovering the meanings of new words in context, making vocabulary acquisition more effective and enjoyable.

3. **Real-time Feedback on Writing:**
   Writing is an essential aspect of language learning, and with our AI, you receive real-time feedback on your written compositions, helping you refine your expression and grammar skills.

4. **Enhancing Speaking Accuracy:**
   Develop confidence in your spoken English with AI-guided speaking practice. Receive constructive feedback on pronunciation and intonation, helping you sound more like a native speaker.

5. **Customized Learning Paths:**
   Our AI algorithms adapt to your strengths and weaknesses, tailoring reading materials, exercises, and support to your individual needs, creating a personalized learning journey.

## Insights from Research into Extensive Reading:
Extensive reading is backed by robust research that demonstrates its effectiveness in language learning:

1. **Enhanced Reading Proficiency:**
   Studies have consistently shown that learners who engage in extensive reading improve their reading proficiency, leading to better overall language skills.

2. **Vocabulary Growth:**
   Research indicates that extensive reading contributes significantly to vocabulary growth, resulting in a more extensive and nuanced lexicon.

3. **Improved Comprehension:**
   Regular exposure to diverse reading materials enhances comprehension abilities, making it easier to understand complex texts.

4. **Boosted Confidence:**
   Avid readers display greater confidence in their language abilities, leading to increased motivation and a positive attitude towards learning.

## Conclusion:
At Reading Advantage, we believe in the powerful combination of extensive reading and AI-driven support to fuel your language learning success. Immerse yourself in captivating stories, access personalized feedback, and watch your language skills soar. Embark on an enriching journey with us, where you're supported by state-of-the-art AI and inspired by the wonders of extensive reading.

**Unlock your language potential today with Reading Advantage - Where AI Meets Extensive Reading. Experience the future of language learning, tailored just for you.**


## Roadmap:
1. Establish functions for creating and evaluating levels of articles. [working]
2. Create simple frontend for choosing article, displaying article, and user evaluation of difficulty.
3. Create auth system and level tracking.
4. Add images to all articles.
5. Provide audio with highlighting by sentence for all articles.
6. Provide an optional translation pane for the current sentence.
7. Option to save specific sentences, translations, and audio for later review.
8. Comprehension questions with feedback.
9. Writing prompts with writing assistance.
10. Running records using speech to text and further analysis.

### Article leveling
1. Uses the NN NLP CEFR project API call (docker image finished) to return confidence of CEFR levels, then calulates weighted average based on GSE levels.
2. Tokenizes text, computes Automated Readability Index, transforms ARI to 20-90 range
3. RA level = 30% ARI + 70% CEFR 
0.3(20+5ARI)+0.7(25A1+35A2+50B1+65B2+75C1+85C2)



```

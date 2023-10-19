
# Roadmap:
1. [x] Establish functions for creating and evaluating levels of articles. [working]
2. [x] Create simple frontend for choosing article, displaying article, and user evaluation of difficulty.
3. [x] Create auth system and level tracking.
4. [x] Add images to all articles.
5. [x] Provide audio with highlighting by sentence for all articles.
6. [ ] Provide an optional translation pane for the current sentence.
7. [x] Option to save specific sentences, translations, and audio for later review.
8. [ ] Vocabulary SRS practice
9. [x] Comprehension questions with feedback.
10. [ ] Writing prompts with writing assistance.
11. [ ] Running records using speech to text and further analysis.
12. [ ] Teacher and classroom management and reporting functions
13. [ ] School admin management and reporting functions
14. [ ] App admin function

## Article leveling
1. Uses the NN NLP CEFR project API call (docker image finished) to return confidence of CEFR levels, then calulates weighted average based on GSE levels.
2. Tokenizes text, computes Automated Readability Index, transforms ARI to 20-90 range
3. RA level = 30% ARI + 70% CEFR 
0.3(20+5ARI)+0.7(25A1+35A2+50B1+65B2+75C1+85C2)



```

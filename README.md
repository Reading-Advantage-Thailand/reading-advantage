# reading-advantage
Extensive reading app incorporating AI.

## Roadmap for M1:
1. Establish functions for creating and evaluating levels of articles. [working]
2. Create simple frontend for choosing article, displaying article, and user evaluation of difficulty.
3. Create auth system and level tracking.

### Article leveling
1. Uses the NN NLP CEFR project API call (docker image finished) to return confidence of CEFR levels, then calulates weighted average based on GSE levels.
2. Tokenizes text, computes Automated Readability Index, transforms ARI to 20-90 range
3. RA level = 30% ARI + 70% CEFR

```

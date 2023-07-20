# reading-advantage
Extensive reading app incorporating AI.

## Timeline for M1:
1. Establish functions for creating and evaluating levels of articles.
2. Create simple frontend for choosing article, displaying article, and user evaluation of difficulty.
3. Create auth system and level tracking.

### Article leveling
1. Uses the NN NLP CEFR project API call (docker image finished) to return confidence of CEFR levels
2. Uses NPM package [vocabulary-level-grader](https://snyk.io/advisor/npm-package/vocabulary-level-grader) to return proportion of vocabulary at or below each CEFR level. We need to calculate each level and use this in the regression.
3. Calculate a zlib compression ratio to see if text is highly repetitive.
4. Use a Python module wordfreq and calculate average log word frequency as follows:

```
# Calculate average log-scale frequency using wordfreq library
frequencies = [wordfreq.zipf_frequency(word, 'en') for word in words]
average_frequency = math.exp(sum(math.log(frequency) for frequency in frequencies) / len(frequencies))
```

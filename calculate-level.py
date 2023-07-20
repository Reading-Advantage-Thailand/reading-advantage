## Some sample functions

# *** Different offline text complexity ratings ***
import nltk
import math
import wordfreq
import zlib

nltk.download('punkt')  # Download required NLTK resource

def calculate_readability_index(text):
    # Tokenize the text into sentences and words
    sentences = nltk.sent_tokenize(text)
    words = nltk.word_tokenize(text)

    # Calculate average sentence length
    average_sentence_length = len(words) / len(sentences)

    # Calculate average word length
    average_word_length = sum(len(word) for word in words) / len(words)

    # Calculate Flesch-Kincaid Grade Level
    fkgl = (0.39 * average_sentence_length) + (11.8 * average_word_length) - 15.59

    # Calculate Automated Readability Index
    ari = (4.71 * average_word_length) + (0.5 * average_sentence_length) - 21.43

    # Calculate average log-scale frequency using wordfreq library
    frequencies = [wordfreq.zipf_frequency(word, 'en') for word in words]
    average_frequency = math.exp(sum(math.log(frequency) for frequency in frequencies) / len(frequencies))
    average_frequency = 21 - (3 * average_frequency)

    # Calculate compression ratio
    compressed_text = zlib.compress(text.encode())
    compression_ratio = len(compressed_text) / len(text)

    # Calculate the final readability index
    readability_index = math.sqrt((fkgl * ari * 10) / (average_frequency * compression_ratio))

    return readability_index

# Example usage
text = "This is a sample text to test the readability index calculation."
index = calculate_readability_index(text)
print(f"Readability Index: {index:.2f}")

# *** NLP NN CEFR evaluation ***
import pandas as pd
import requests
import json

def call_api(text):
    # This is a placeholder function where you'll put the actual API call
    # Replace the URL with your actual API URL
    API_URL = "http://api-url/predict"

    # Prepare the data for the API call
    data = {"texts": [text]}

    # Make the API call
    response = requests.post(API_URL, json=data)

    # Check the status code of the response
    if response.status_code != 200:
        print(f"API request failed with status code {response.status_code}")
        return None

    # Parse the response
    result = response.json()

    # Return the level and scores
    return result[0]["level"], result[0]["scores"]

# Load the CSV data into a pandas DataFrame
df = pd.read_csv('path_to_your_file.csv')

# Initialize empty lists to store the levels and scores
levels = []
scores = []

# For each row in the DataFrame, call the API and append the results to the lists
for text in df['article text']:
    level, score = call_api(text)
    levels.append(level)
    scores.append(score)

# Add the levels and scores to the DataFrame
df['level'] = levels
df['scores'] = scores

# Write the DataFrame back to a new CSV file
df.to_csv('path_to_output_file.csv', index=False)

# *** NLP NN CEFR with weighted average
import csv
import requests

# API endpoint URL
api_url = 'http://api-endpoint-url/predict'

# Weighted average values
weighted_values = {
    'A1': 10,
    'A2': 35,
    'B1': 50,
    'B2': 65,
    'C1': 80,
    'C2': 90
}

# Function to calculate the weighted average
def calculate_weighted_average(scores):
    total_weight = sum(weighted_values.values())
    weighted_sum = sum(weighted_values[level] * scores[level] for level in scores)
    return weighted_sum / total_weight

# Read CSV file
with open('input.csv', 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    rows = list(reader)

# Process each row
for row in rows:
    # Extract text from the row
    text = row['article text']
    
    # Make API request
    payload = {'texts': [text]}
    response = requests.post(api_url, json=payload)
    
    # Parse API response
    if response.status_code == 200:
        api_data = response.json()
        if api_data:
            scores = api_data[0]['scores']
            weighted_average = calculate_weighted_average(scores)
            row['weighted_average'] = weighted_average
    
    # Uncomment the following lines if you want to print the API response for each row
    # else:
    #     print(f"API request failed for row: {row['title']}. Status code: {response.status_code}")

# Write updated data to a new CSV file
output_file = 'output.csv'
fieldnames = reader.fieldnames + ['weighted_average']
with open(output_file, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Processed data written to {output_file}")

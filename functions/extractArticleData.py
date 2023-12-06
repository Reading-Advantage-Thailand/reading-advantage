#/usr/bin/python3
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
from pathlib import Path
import asyncio
from aiofile import AIOFile
import json

# Load environment variables
load_dotenv(dotenv_path='../web/.env.local')

# Create the OpenAI client with AsyncOpenAI
client = AsyncOpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

# Define directory path
directory_path = Path('/Users/may/CEFR-English-Level-Predictor-api/data/test/') 

list_descriptions = {
    "type": "fiction or non-fiction.",
    "genre": "Genre within that type.",
    "subGenre": "Subgenre within that genre.",
    "title": "The specific topic within that subgenre.",
    "story": "Organize the article with a clear introduction that outlines the topic, a body where the main points are explained in a logical sequence",
    "summary": "A concise conclusion summarizing the key ideas",
    "image": "Create a description of an image suitable to be displayed alongside and write a one-sentence summary with no spoilers.",
}

required_fields = [
    "type",
    "genre",
    "subGenre",
    "title",
    "story",
    "summary",
    "image",
]

schema = {
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "description": "fiction or non-fiction -- choose one unless you are provided one.",
        },
        "genre": {
            "genre": "string",
            "description": "Genre within that type.",
        },
        "subGenre": {
            "subGenre": "string",
            "description": "Subgenre within that genre.",
        },
        "title": {
            "title": "string",
            "description": "The specific topic within that subgenre.",
        },
        "story": {
            "story": "string",
            "description": "Organize the article with a clear introduction that outlines the topic, a body where the main points are explained in a logical sequence.",
        },
        "summary": {
            "summary": "string",
            "description": "A concise conclusion summarizing the key ideas.",
        },
        "image": {
            "image": "string",
            "description": "Create a description of an image suitable to be displayed alongside and write a one-sentence summary with no spoilers.",
        },
    },
    "required": [
        "type",
        "genre",
        "subGenre",
        "title",
        "story",
        "summary",
        "image",
    ],
}


async def read_files_in_directory(directory_path):
    # Read the list of files in the directory
    try:
        files = os.listdir(directory_path)
    except OSError as e:
        print(f"Error reading directory: {e}")
        return

    # Iterate through the files
    for file in files:
        # Construct the full path of the file
        file_path = Path(directory_path) / file
        # await generate_extract_prompt(file_path) 
        try:
            await asyncio.wait_for(generate_extract_prompt(file_path), timeout=60)
        except asyncio.TimeoutError:
            print(f"generate_extract_prompt for {file_path} timed out after 60 seconds")
            # Log the filename that timed out
            with open('./log/timeout_log.txt', 'a') as log_file:
                log_file.write(str(file_path) + '\n')
            continue  # Skip to the next file


async def read_article_async(article_path):
    try:
        async with AIOFile(article_path, 'r') as afp:
            data = await afp.read()
        return data
    except Exception as e:
        print(e)

async def generate_extract_prompt(article_path):
    print(f"Content Path: {article_path}")
    try:
        response = await get_valid_responses(article_path)
        # print(f"Complete response: {response}")
    except Exception as e:
        print(e)


async def openai_operation(prompt, schema, file_name, content):
    cache_response  = {}
    while True:
        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an article database assistant."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                functions=[
                    {
                        "name": "get_article_data",
                        "parameters": schema
                    }
                ],
                function_call={
                    "name": "get_article_data"
                },
                temperature=0.7
            )

            result = json.loads(response.choices[0].message.function_call.arguments)

            missing_or_invalid_fields = [field for field in required_fields if field not in result or result[field] is None or result[field] == ""]
            if not missing_or_invalid_fields:
                cache_response = result

            missing_or_invalid_fields = [field for field in required_fields if field not in cache_response or cache_response[field] is None or cache_response[field] == ""]

            if missing_or_invalid_fields:
                for field in missing_or_invalid_fields:
                    cache_response[field] = result.get(field)
                print(f"Missing or invalid fields: {missing_or_invalid_fields}. Regenerating response...")
                continue
            
            data = {
                "type": cache_response['type'],
                "genre": cache_response['genre'],
                "subGenre": cache_response['subGenre'],
                "title": cache_response['title'],
                "story": content,
                "summary": cache_response['summary'],
                "image": cache_response['image']
            }
            outputFileName = "./results/A1/" + file_name.rsplit('.', 1)[0] + "-result.json"
            with open(outputFileName, 'w') as f:
                json.dump(data, f)
            cache_response = {}
            return json.dumps(data)
        except Exception as e:
            print(e)
            break

async def get_valid_responses(article_path):
    content = await read_article_async(article_path)
    content = content.replace("\n", " ")
    prompt = f"For the following content, please determine type (fiction/nonfiction), genre, and subgenre. Then create a title, a description of an image suitable to be displayed alongside and write a one-sentence summary with no spoilers.\ncontent: {content}"
    file_name = os.path.basename(article_path)

    try:
        response = await openai_operation(prompt, schema, file_name, content)
        response = json.loads(response)
        print(f"Final Response for {file_name} :  ", response)
    except Exception as e:
        print(e)

async def main() -> None:
    await read_files_in_directory(directory_path)


asyncio.run(main())
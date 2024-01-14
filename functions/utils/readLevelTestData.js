const fs = require('fs');
const path = require('path');

function readLevelTestData() {
  const filePath = "/Users/may/reading-advantage/data/level-test.json";

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(data);
    console.log('This is jsonData:', jsonData["language_placement_test"]);
    return jsonData["language_placement_test"]; 
  } catch (error) {
    console.error('Error reading level-test.json:', error);
    return null;
  }

}

module.exports = { readLevelTestData };
readLevelTestData();
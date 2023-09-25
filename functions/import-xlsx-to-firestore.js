const xlsx = require('xlsx');
const fs = require('fs');

// Define file paths
const file1 = '../data/GSE_Academic_Reading_Descriptors.xlsx';
const file2 = '../data/GSE_Young_Learner_Descriptors.xlsx';
const file3 = '../data/GSE_Young_Learner_Writing_Descriptors.xlsx';

// Load Excel files
const workbook1 = xlsx.readFile(file1);
const workbook2 = xlsx.readFile(file2);
const workbook3 = xlsx.readFile(file3);

// Function to parse Excel data into the desired format
function parseExcelData(workbook) {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
}

// Parse Excel data
const data1 = parseExcelData(workbook1);
const data2 = parseExcelData(workbook2);
const data3 = parseExcelData(workbook3);

// Function to combine data from the three Excel files
function combineData(descriptors1, descriptors2, descriptors3) {
    // Create a map to store data by GSE level
    const combinedData = new Map();

    // Function to add descriptors to the combined data
    function addDescriptorsToMap(data) {

// const xlsx = require('xlsx');
// const fs = require('fs');
// const { parse } = require('path');

// function readXlsxFile(filePath) {
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     return xlsx.utils.sheet_to_json(sheet);
// }

// function combineData(descriptors1, descriptors2, descriptors3) {
//     // Create a map to store data by GSE level
//     const combinedData = new Map();

//     // Function to add descriptors to the combined data
//     function addDescriptorsToMap(data) {
//         data.forEach(item => {
//             const gse = parseInt(item.GSE);
//             if (!combinedData.has(gse)) {
//                 combinedData.set(gse, {
//                     descriptors: [],
//                     cefr: item.CEFR
//                 });
//             }
//             combinedData.get(gse).descriptors.push(item.Descriptors);
//         });
//     }

//     // Add descriptors from each file to the combined data
//     addDescriptorsToMap(descriptors1);
//     addDescriptorsToMap(descriptors2);
//     addDescriptorsToMap(descriptors3);

//     // Convert the combined data to an array of objects
//     const combinedArray = Array.from(combinedData, ([gse, data]) => ({ GSE: gse, ...data }));

//     return combinedArray;
// }

// // Paths to the three XLSX files
// const file1 = '../data/GSE_Academic_Reading_Descriptors.xlsx';
// const file2 = '../data/GSE_Young_Learner_Descriptors.xlsx';
// const file3 = '../data/GSE_Young_Learner_Writing_Descriptors.xlsx';

// // Read data from the three XLSX files
// const data1 = readXlsxFile(file1);
// const data2 = readXlsxFile(file2);
// const data3 = readXlsxFile(file3);

// // Combine the data
// const combinedData = combineData(data1, data2, data3);

// // Export combined data to a JSON file
// const jsonOutput = JSON.stringify(combinedData, null, 2);
// fs.writeFileSync('combined_descriptors.json', jsonOutput);

// console.log('Combined data exported to combined_descriptors.json');

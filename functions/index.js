const xlsx = require('xlsx');
const fs = require('fs');

// Define file paths
const file1 = '../data/GSE_Academic_Reading_Descriptors.xlsx';
const file2 = '../data/GSE_Young_Learner_Descriptors.xlsx';
const file3 = '../data/GSE_Young_Learner_Writing_Descriptors.xlsx';

function readXlsxFile(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
}

const type1 = 'AR';
const type2 = 'YL';
const type3 = 'W';

// Read data from all three files
const data1 = readXlsxFile(file1);
const data2 = readXlsxFile(file2);
const data3 = readXlsxFile(file3);

// Combine and format the data
const combinedData = {};

[data1, data2, data3].forEach((data, index) => {
    const type = index === 0 ? type1 : index === 1 ? type2 : type3;

    data.forEach((row, rowIndex) => {
        const id = `${row['GSE']}.${type}.${rowIndex + 2}`;
        if (!combinedData[row['GSE']]) {
            combinedData[row['GSE']] = {
                GSE: row['GSE'],
                descriptors: [],
                cefr: row['CEFR']
            };
        }
        combinedData[row['GSE']].descriptors.push({
            id: id,
            desc: row['Descriptors']
        });
    });
});

// Convert the combined data object into an array
const combinedArray = Object.values(combinedData);

// Write the combined data to a JSON file
fs.writeFileSync('../data/combined.json', JSON.stringify(combinedArray, null, 2));
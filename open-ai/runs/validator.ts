import fs from 'fs';

// Function to re-arrange the data into a structured format
// The article shoule have only type, genre, subgenre, title, summary, image_description, passage
async function validator(data: any): Promise<{
    type: string;
    genre: string;
    subgenre: string;
    title: string;
    summary: string;
    image_description: string;
    passage: string;
}> {
    const { type, genre, subgenre, title, summary, image_description, passage } =
        data;
    return { type, genre, subgenre, title, summary, image_description, passage };
}

async function run() {
    // Read from the folder
    const folder1 = 'A2_fiction';
    const folder2 = 'A2_nonfiction';
    const files1 = fs.readdirSync(process.cwd() + '/data/' + folder1);
    const files2 = fs.readdirSync(process.cwd() + '/data/' + folder2);

    // Validate the data
    let errorCount = 0;
    let successCount = 0;
    let validatedCount = 0;
    let logs: { fileName: string; error: string }[] = [];
    let validatedLogs: { fileName: string; error: string }[] = [];

    for (let i = 0; i < files1.length; i++) {
        const fileName = files1[i];
        const data = JSON.parse(
            fs.readFileSync(
                process.cwd() + '/data/' + folder1 + '/' + fileName,
                'utf8',
            ),
        );
        const validatedData = await validator(data);
        fs.writeFileSync(
            process.cwd() + '/data/' + folder1 + '/' + fileName,
            JSON.stringify(validatedData, null, 2),
        );
    }

    for (let i = 0; i < files2.length; i++) {
        const fileName = files2[i];
        const data = JSON.parse(
            fs.readFileSync(
                process.cwd() + '/data/' + folder2 + '/' + fileName,
                'utf8',
            ),
        );
        const validatedData = await validator(data);
        fs.writeFileSync(
            process.cwd() + '/data/' + folder2 + '/' + fileName,
            JSON.stringify(validatedData, null, 2),
        );
    }
    console.log('Success Count:', successCount);
    console.log('Error Count:', errorCount);
    console.log('Validated Count:', validatedCount);
    console.log('Logs:', logs);
    console.log('Validated Logs:', validatedLogs);

    if (validatedLogs.length > 0) {
        fs.writeFileSync(
            process.cwd() + '/data/errors/validated_logs.json',
            JSON.stringify(validatedLogs, null, 2),
        );
    }
}

run();

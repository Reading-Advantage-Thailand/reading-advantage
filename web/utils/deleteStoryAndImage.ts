import storage from "./storage";
import db from "@/configs/firestore-config";

export async function deleteStoryAndImages(storyId: string) {
    try {
        console.log(`Deleting story and images for: ${storyId}`);

        const bucketName = 'artifacts.reading-advantage.appspot.com';
        const bucket = storage.bucket(bucketName);

        // กำหนด path ของไฟล์ภาพหลักของเรื่องราว (ตัวเรื่องเอง)
        const storyImagePath = `images/${storyId}.png`; // เปลี่ยนเป็นโฟลเดอร์ที่เก็บรูปจริง
        const storyImageFile = bucket.file(storyImagePath);

        // ลบไฟล์ภาพหลักของเรื่อง
        await storyImageFile.delete().catch((err) => {
            console.warn(`Warning: Story image not found or already deleted: ${storyImagePath}`);
        });

        console.log(`Deleted story image: ${storyImagePath}`);

        // ลบไฟล์ภาพของบททั้งหมด (เช่น storyId-1.png, storyId-2.png)
        const chapterPrefix = `images/${storyId}-`; // เปลี่ยนเป็นโฟลเดอร์ที่เก็บรูปจริง
        const [files] = await bucket.getFiles({ prefix: chapterPrefix });

        if (files.length > 0) {
            await Promise.all(files.map((file) => file.delete()));
            console.log(`Deleted all chapter images with prefix: ${chapterPrefix}`);
        } else {
            console.warn(`No chapter images found with prefix: ${chapterPrefix}`);
        }

        // ลบเอกสารของเรื่องราวจาก Firestore
        await db.collection("stories").doc(storyId).delete();
        console.log(`Successfully deleted story ${storyId} and all associated images.`);
    } catch (error) {
        console.error(`Failed to delete story ${storyId}:`, error);
    }
}

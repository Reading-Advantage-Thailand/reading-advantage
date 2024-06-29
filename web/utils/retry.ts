export async function retry<T>(fn: () => Promise<T>, retries: number = 1): Promise<T> {
    let attempts = 0;
    while (attempts < retries) {
        try {
            return await fn();
        } catch (error) {
            attempts++;
            console.log(`Attempt ${attempts} failed:`, error);
            if (attempts >= retries) {
                console.log("Exceeded maximum retries");
                throw error;
            }
        }
    }
    throw new Error("Exceeded maximum retries");
}
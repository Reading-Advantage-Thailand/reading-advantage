export const fetchData = async <T>(
    url: string,
    options: RequestInit,
    toastOptions?: { title: string; description?: string }
): Promise<T> => {
    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.json();
        console.error(error);
        throw new Error(error.message || 'Failed to fetch data');
    }

    const data: T = await response.json();
    return data;
};


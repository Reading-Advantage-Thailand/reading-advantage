// dateFormat.ts
interface Timestamp {
    _seconds: number;
    _nanoseconds: number;
}

function formatDate(createdAt: Timestamp): string {
    const timestampMilliseconds = createdAt._seconds * 1000 + Math.round(createdAt._nanoseconds / 1000000);
    const date = new Date(timestampMilliseconds);

    const addLeadingZero = (number: number): string => (number < 10 ? `0${number}` : `${number}`);

    const formattedDate =
        `${addLeadingZero(date.getDate())}:${addLeadingZero(date.getMonth() + 1)}:${date.getFullYear()} ` +
        `${addLeadingZero(date.getHours() % 12 || 12)}:${addLeadingZero(date.getMinutes())}${date.getHours() >= 12 ? 'pm' : 'am'}`;

    return formattedDate;
}

export default formatDate;

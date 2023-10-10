import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// const date = new Date(createdAt._seconds * 1000).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
//Date formatting
export function formatDate(updatedAt: { _seconds: number, _nanoseconds: number }): string {
  const currentDate = new Date();
  const updatedDate = new Date(updatedAt._seconds * 1000);

  const timeDifferenceInSeconds = Math.floor((currentDate.getTime() - updatedDate.getTime()) / 1000);

  if (timeDifferenceInSeconds < 60) {
    return `${timeDifferenceInSeconds} seconds ago`;
  } else if (timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (timeDifferenceInSeconds < 86400) {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(timeDifferenceInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}

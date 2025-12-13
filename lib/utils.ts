import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// lib/utils.ts
export function formatCurrency(amount: number | undefined | null, currency: string = 'M'): string {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    console.warn('formatCurrency received invalid amount:', amount);
    return `${currency}0.00`;
  }

  return `${currency}${Number(amount).toFixed(2)}`;
}


export function formatDate(date: Date | string, format: string = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Simple date formatting
  const options: Intl.DateTimeFormatOptions = {};

  if (format.includes('MMM')) {
    options.month = 'short';
  }
  if (format.includes('dd')) {
    options.day = '2-digit';
  }
  if (format.includes('yyyy')) {
    options.year = 'numeric';
  }
  if (format.includes('hh') || format.includes('mm')) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = format.includes('a');
  }

  return d.toLocaleDateString('en-US', options);
}

export function formatTime(date: Date | string, format: string = 'hh:mm a'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format.includes('a'),
  };

  return d.toLocaleTimeString('en-US', options);
}
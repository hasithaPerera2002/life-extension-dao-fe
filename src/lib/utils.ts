
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
}

export function formatTokenAmount(amount: string | number, decimals = 4): string {
  let parsedAmount: number;
  
  if (typeof amount === 'string') {
    parsedAmount = parseFloat(amount);
  } else {
    parsedAmount = amount;
  }
  
  if (isNaN(parsedAmount)) return '0';
  
  return parsedAmount.toFixed(decimals);
}

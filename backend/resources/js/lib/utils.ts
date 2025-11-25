import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const sausColors = {
  primary: "text-saus-500 hover:text-saus-600",
  bgPrimary: "bg-saus-500 hover:bg-saus-600",
  borderPrimary: "border-saus-500 hover:border-saus-600",
  gradient: "bg-gradient-to-r from-saus-500 to-sausOrange-500",
}

export const sausDarkColors = {
  primary: "text-sausDark-500 hover:text-sausDark-600",
  bgPrimary: "bg-sausDark-500 hover:bg-sausDark-600",
  borderPrimary: "border-sausDark-500 hover:border-sausDark-600",
  gradient: "bg-gradient-to-r from-sausDark-500 to-sausDarkOrange-500",
}

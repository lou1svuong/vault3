import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyWithToast(
  copyFn: (text: string) => Promise<boolean>,
  value: string,
  label: string
) {
  const ok = await copyFn(value);
  if (ok) {
    toast.success(`${label} copied!`);
  } else {
    toast.error(`Failed to copy ${label.toLowerCase()}.`);
  }
}
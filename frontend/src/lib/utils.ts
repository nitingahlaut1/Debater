import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 70) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
  if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
}

export function getTurnLabel(turn: string, round: number, totalRounds: number): string {
  if (round === 1) {
    if (turn.includes('ARGUMENT') || turn.includes('OPENING')) return 'Opening Statement';
    return 'Opening Counterargument';
  }
  if (round === totalRounds) {
    return 'Closing Statement';
  }
  return `Round ${round} Rebuttal`;
}

import type { RepeatType } from '../types';

export const getRepeatOptions = (): Exclude<RepeatType, 'none'>[] => {
  return ['daily', 'weekly', 'monthly', 'yearly'];
};

export const getRepeatOptionLabel = (type: RepeatType): string => {
  const labels: Record<RepeatType, string> = {
    none: '반복 안함',
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  };

  return labels[type];
};

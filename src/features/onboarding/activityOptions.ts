import type { ActivityLevel } from '@/src/types/database';

export const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  title: string;
  description: string;
}[] = [
  {
    value: 'sedentary',
    title: 'Mostly sitting',
    description: 'Desk work, little walking',
  },
  {
    value: 'light',
    title: 'Light movement',
    description: 'Short walks and light chores',
  },
  {
    value: 'moderate',
    title: 'Moderately active',
    description: 'Regular walks or exercise a few times a week',
  },
  {
    value: 'active',
    title: 'Very active',
    description: 'Exercise most days',
  },
  {
    value: 'very_active',
    title: 'Extra active',
    description: 'Hard exercise or physical work most days',
  },
];

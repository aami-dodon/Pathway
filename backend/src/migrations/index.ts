import * as migration_20251228_012822 from './20251228_012822';

export const migrations = [
  {
    up: migration_20251228_012822.up,
    down: migration_20251228_012822.down,
    name: '20251228_012822'
  },
];

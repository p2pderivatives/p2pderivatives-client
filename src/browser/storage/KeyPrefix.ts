export enum KeyPrefix {
  CONFIG = 1,
  CONTRACT = 2,
}

export function getKeyPrefix(key: KeyPrefix): string {
  return key.toString().padStart(2, '0')
}

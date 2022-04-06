export const getLsItem = (key: string) =>
  typeof window === 'undefined' ? null : localStorage.getItem(key);

export const setLsItem = (key: string, value: string) =>
  typeof window === 'undefined' ? undefined : localStorage.setItem(key, value);

export const removeLsItem = (key: string) =>
  typeof window === 'undefined' ? undefined : localStorage.removeItem(key);

import { customAlphabet } from 'nanoid';

/** Id nội bộ cho mọi bảng: 12 ký tự URL-safe. */
export const newId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);

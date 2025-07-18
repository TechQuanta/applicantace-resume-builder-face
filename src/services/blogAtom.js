// src/recoil/blogAtom.js
import { atom } from 'recoil';

export const blogCardsState = atom({
  key: 'blogCardsState', // unique ID (with respect to other atoms/selectors)
  default: [], // default value (empty array initially)
});

export const blogLoadingState = atom({
  key: 'blogLoadingState',
  default: true, // true initially
});
import { CategoryItem, Transaction } from '../types';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-food', name: '食費', iconName: 'Utensils' },
  { id: 'cat-daily', name: '日用品', iconName: 'ShoppingBag' },
  { id: 'cat-transport', name: '交通費', iconName: 'Train' },
  { id: 'cat-cafe', name: 'カフェ・軽食', iconName: 'CupSoda' },
  { id: 'cat-medical', name: '医療・病院', iconName: 'HeartPulse' },
  { id: 'cat-communication', name: '通信費', iconName: 'Smartphone' },
  { id: 'cat-beauty', name: '美容・衣服', iconName: 'Scissors' },
  { id: 'cat-hobby', name: '趣味・娯楽', iconName: 'Sparkles' },
  { id: 'cat-allowance', name: 'お小遣い', iconName: 'Coins' },
  { id: 'cat-other', name: 'その他', iconName: 'Tag' },
];

// Start completely clean for any new user or first launch
export const INITIAL_TRANSACTIONS: Transaction[] = [];

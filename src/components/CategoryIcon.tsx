import React from 'react';
import {
  Utensils,
  CupSoda,
  Umbrella,
  Scissors,
  HeartPulse,
  Smartphone,
  ShoppingBag,
  Train,
  Pill,
  Coins,
  Receipt,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils className={className} />;
    case 'CupSoda':
      return <CupSoda className={className} />;
    case 'Umbrella':
      return <Umbrella className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Smartphone':
      return <Smartphone className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Train':
      return <Train className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'Coins':
      return <Coins className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    default:
      return <Receipt className={className} />;
  }
};

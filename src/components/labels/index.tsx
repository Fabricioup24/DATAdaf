import React from 'react';

/**
 * Valid category types for blog labels
 */
export type LabelCategory = 
  | 'metodologia' 
  | 'ciencia-de-datos' 
  | 'machine-learning' 
  | 'geolocalizacion' 
  | 'investigacion' 
  | 'web-scraping'
  | 'analisis';

interface BlogLabelProps {
  /** The category key to display */
  category: LabelCategory;
  /** Optional custom class names */
  className?: string;
}

/**
 * Configuration for each category (label text and tailwind colors)
 */
const CATEGORY_CONFIG: Record<LabelCategory, { text: string; classes: string }> = {
  'metodologia': {
    text: 'Metodología',
    classes: 'bg-blue-600 text-white shadow-blue-600/20'
  },
  'ciencia-de-datos': {
    text: 'Ciencia de Datos',
    classes: 'bg-purple-600 text-white shadow-purple-600/20'
  },
  'machine-learning': {
    text: 'Machine Learning',
    classes: 'bg-indigo-600 text-white shadow-indigo-600/20'
  },
  'geolocalizacion': {
    text: 'Geolocalización',
    classes: 'bg-emerald-600 text-white shadow-emerald-600/20'
  },
  'investigacion': {
    text: 'Investigación',
    classes: 'bg-orange-600 text-white shadow-orange-600/20'
  },
  'web-scraping': {
    text: 'Web Scraping',
    classes: 'bg-rose-600 text-white shadow-rose-600/20'
  },
  'analisis': {
    text: 'Análisis',
    classes: 'bg-cyan-600 text-white shadow-cyan-600/20'
  }
};

/**
 * Reusable Labels component to maintain visual consistency across all blog posts.
 * 
 * @param {BlogLabelProps} props - The component props
 * @returns {JSX.Element} The rendered Label
 */
const Labels = ({ category, className = '' }: BlogLabelProps) => {
  const config = CATEGORY_CONFIG[category];

  if (!config) return null;

  return (
    <span className={`px-5 py-1.5 text-[11px] uppercase tracking-[0.3em] font-black rounded-full shadow-lg transition-transform hover:scale-105 cursor-default inline-block ${config.classes} ${className}`}>
      {config.text}
    </span>
  );
};

export default Labels;

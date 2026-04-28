import Labels, { type LabelCategory } from './labels';

/**
 * Props for the BlogCard component
 */
interface BlogCardProps {
  /** Title of the blog post */
  title: string;
  /** Brief description or excerpt */
  excerpt: string;
  /** Date of publication */
  date: string;
  /** Optional image URL */
  imageUrl?: string;
  /** Category or tag */
  category?: LabelCategory;
  /** Visual variant of the card */
  variant?: 'light' | 'dark';
  /** Optional explicit slug to avoid deriving the route from the title */
  slug?: string;
}

/**
 * BlogCard component for displaying blog entries with a premium aesthetic.
 * 
 * @param {BlogCardProps} props - The component props
 * @returns {JSX.Element} The rendered BlogCard
 */
const BlogCard = ({
  title,
  excerpt,
  date,
  imageUrl,
  category = 'analisis',
  variant = 'dark',
  slug,
}: BlogCardProps) => {
  const isLight = variant === 'light';
  const href = `/blog/${slug ?? title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <article className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:translate-y-[-12px] 
      ${isLight 
        ? 'bg-white border border-[#121212]/5 hover:border-[#121212]/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]' 
        : 'bg-[#1a1a1a] border border-white/10 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'}`}>
      
      {imageUrl && (
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {!isLight && <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60" />}
        </div>
      )}
      
      <div className="p-10">
        <div className="flex items-center gap-4 mb-6">
          <Labels category={category} className="!px-4 !py-1 !text-[10px]" />
          <time className={`text-xs font-bold ${isLight ? 'text-[#121212]/30' : 'text-white/40'}`}>{date}</time>
        </div>
        
        <h3 className={`text-3xl font-black mb-6 leading-[1.1] tracking-tight transition-colors 
          ${isLight ? 'text-[#121212] group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'}`}>
          {title}
        </h3>
        
        <p className={`text-base leading-relaxed mb-8 font-medium
          ${isLight ? 'text-[#121212]/50' : 'text-white/60'}`}>
          {excerpt}
        </p>
        
        <a 
          href={href}
          className={`inline-flex items-center gap-3 font-black text-xs uppercase tracking-widest group/link
            ${isLight ? 'text-[#121212]' : 'text-white'}`}
        >
          Leer más 
          <div className={`w-8 h-[2px] transition-all duration-300 group-hover/link:w-12 
            ${isLight ? 'bg-[#121212]' : 'bg-white'}`}></div>
        </a>
      </div>
      
      {/* Decorative shimmer effect */}
      <div className={`absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700
        ${isLight ? 'group-hover:via-blue-50/30' : 'group-hover:via-white/5'}`} />
    </article>
  );
};

export default BlogCard;

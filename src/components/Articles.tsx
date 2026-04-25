interface Article {
  id: number;
  title: string;
  description: string;
  date: string;
  link: string;
}

export default function Articles() {
  const articles: Article[] = [
    {
      id: 1,
      title: "Título del Artículo 1",
      description: "Breve descripción del primer artículo sobre desarrollo web.",
      date: "2025-01-15",
      link: "#"
    },
    {
      id: 2,
      title: "Título del Artículo 2",
      description: "Breve descripción del segundo artículo sobre tecnología.",
      date: "2025-02-20",
      link: "#"
    },
    {
      id: 3,
      title: "Título del Artículo 3",
      description: "Breve descripción del tercer artículo sobre diseño.",
      date: "2025-03-10",
      link: "#"
    }
  ];

  return (
    <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 py-8 max-md:grid-cols-1 max-md:gap-6 max-md:py-4">
      {articles.map((article) => (
        <article 
          key={article.id} 
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-8 transition-all duration-300 ease-in-out flex flex-col hover:bg-[#222] hover:border-[#555] hover:-translate-y-[5px] max-md:p-6"
        >
          <div className="text-[#888] text-[0.875rem] mb-4 uppercase tracking-[1px]">
            {article.date}
          </div>
          <h3 className="text-[1.5rem] m-0 mb-4 leading-[1.3] text-white max-md:text-[1.25rem]">
            {article.title}
          </h3>
          <p className="text-[1rem] text-[#a0a0a0] leading-[1.6] grow m-0 mb-6">
            {article.description}
          </p>
          <a 
            href={article.link} 
            className="text-white no-underline font-bold text-[0.95rem] inline-flex items-center transition-all duration-300 ease-in-out hover:text-[#a0a0a0] hover:translate-x-[5px]"
          >
            Leer más →
          </a>
        </article>
      ))}
    </div>
  );
}

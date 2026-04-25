export default function Articles() {
  const articles = [
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
    <div className="articles-container">
      {articles.map((article) => (
        <article key={article.id} className="article-item">
          <div className="article-date">{article.date}</div>
          <h3>{article.title}</h3>
          <p>{article.description}</p>
          <a href={article.link} className="article-link">
            Leer más →
          </a>
        </article>
      ))}
    </div>
  );
}

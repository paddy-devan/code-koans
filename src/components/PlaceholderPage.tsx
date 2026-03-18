type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="panel">
      <p className="eyebrow">Checkpoint 1</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

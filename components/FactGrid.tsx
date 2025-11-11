import { factCards } from "@/lib/storyData";

export function FactGrid() {
  return (
    <section className="fact-grid" aria-label="Monky lore fact cards">
      <header className="fact-grid__header">
        <h3>Field Notes</h3>
        <p>
          Every frame is rooted in real primate science. Tap into the facts that shaped the Monky Odyssey storyboard.
        </p>
      </header>
      <div className="fact-grid__cards">
        {factCards.map((card) => (
          <article key={card.title} className="fact-grid__card">
            <header>
              <h4>{card.title}</h4>
            </header>
            <p className="fact-grid__fact">{card.fact}</p>
            <p className="fact-grid__takeaway">{card.takeaway}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

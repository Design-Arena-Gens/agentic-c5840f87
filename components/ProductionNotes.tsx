import { productionNotes } from "@/lib/storyData";

export function ProductionNotes() {
  return (
    <section className="production" aria-label="Production blueprint">
      <header className="production__header">
        <h3>Production Blueprint</h3>
        <p>
          A one-minute web-native film still needs cinematic rigor. These are the creative guardrails that keep Kiko&apos;s
          adventure cohesive from storyboard to final render.
        </p>
      </header>
      <div className="production__grid">
        {productionNotes.map((note) => (
          <article key={note.heading} className="production__card">
            <h4>{note.heading}</h4>
            <ul>
              {note.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

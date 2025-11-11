import { commentaryScript } from "@/lib/storyData";

export function CommentaryScript() {
  return (
    <section className="commentary" aria-label="Narration script">
      <header className="commentary__header">
        <h3>Director&apos;s Commentary</h3>
        <p>
          Narrate the journey live or feed these cues into your favorite AI voice—each timestamp syncs perfectly with the
          Monky Cinema timeline.
        </p>
      </header>
      <ul className="commentary__list">
        {commentaryScript.map((line) => (
          <li key={line.timestamp} className="commentary__item">
            <span className="commentary__timestamp">{line.timestamp}</span>
            <div className="commentary__content">
              <h4>{line.title}</h4>
              <p>{line.narration}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

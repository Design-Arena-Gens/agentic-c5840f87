import { STORY_DURATION, sceneBeats } from "@/lib/storyData";

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function SceneTimeline() {
  return (
    <section id="timeline" className="timeline" aria-label="Scene timeline">
      <header className="timeline__header">
        <h3>Storyboard Timeline</h3>
        <p>
          Each beat in the video maps to a sensory pivot—follow along to see how Kiko&apos;s world unfolds in
          sixty seconds.
        </p>
      </header>
      <ol className="timeline__list">
        {sceneBeats.map((beat, index) => {
          const nextTime = sceneBeats[index + 1]?.time ?? STORY_DURATION;
          const duration = nextTime - beat.time;
          return (
            <li key={beat.label} className="timeline__item">
              <div className="timeline__item__marker" aria-hidden="true" />
              <div className="timeline__item__body">
                <div className="timeline__item__meta">
                  <span className="timeline__item__timestamp">{formatTime(beat.time)}</span>
                  <span className="timeline__item__duration">Duration {formatTime(duration)}</span>
                </div>
                <h4>{beat.label}</h4>
                <p>{beat.description}</p>
                <span className="timeline__item__focus">Focus: {beat.focus}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

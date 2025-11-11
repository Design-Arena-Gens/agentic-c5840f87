import { CommentaryScript } from "@/components/CommentaryScript";
import { FactGrid } from "@/components/FactGrid";
import { MonkyCinema } from "@/components/MonkyCinema";
import { ProductionNotes } from "@/components/ProductionNotes";
import { SceneTimeline } from "@/components/SceneTimeline";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero__badge">Web-Original Wild Docu-Short</div>
        <h1>Monky Odyssey</h1>
        <p>
          Meet Kiko, the vine-surfing monky whose day-long adventure is compressed into a sixty-second cinematic loop.
          Watch the stylized video, then dive into the timeline, science notes, and director commentary.
        </p>
        <div className="hero__actions">
          <a className="hero__button" href="#monky-cinema">
            Watch Now
          </a>
          <a className="hero__link" href="#timeline">
            Explore Storyboard
          </a>
        </div>
      </section>
      <MonkyCinema />
      <SceneTimeline />
      <FactGrid />
      <ProductionNotes />
      <CommentaryScript />
      <footer className="footer">
        <p>Crafted for the web · Deployable to Vercel · © {new Date().getFullYear()} Monky Odyssey Lab</p>
      </footer>
    </main>
  );
}

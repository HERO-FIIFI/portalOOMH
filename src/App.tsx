import { Challenge, HowItWorks, Rules } from "./components/Brief";
import { Footer, Nav, Ticker } from "./components/Chrome";
import { Masthead } from "./components/Masthead";
import { Portal } from "./components/Portal";
import { useRevealObserver } from "./hooks";

export default function App() {
  useRevealObserver();

  return (
    <div className="relative min-h-screen bg-ink font-body text-cream">
      <div className="noise-layer" aria-hidden="true" />
      <Ticker />
      <Nav />
      <main>
        <Masthead />
        <Challenge />
        <HowItWorks />
        <Rules />
        <Portal />
      </main>
      <Footer />
    </div>
  );
}

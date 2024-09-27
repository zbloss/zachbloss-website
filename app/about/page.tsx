import { Navigation } from "../components/Navigation";


export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-medium">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/images/black-ink-background.png")' }}
      ></div>
      <div className="relative z-1 min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl mb-4 font-bold">Coming Soon!</h1>
          </div>
        </main>
      </div>
    </div>
  );
}
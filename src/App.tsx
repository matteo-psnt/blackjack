import React, { useEffect, useState } from 'react';
import './styles/index.css';
import Game from './components/Game';

function App() {
  const aspectRatio = 1300 / 720;
  const [componentSize, setComponentSize] = useState({ width: 0, height: 0 });
  const [fontSize, setFontSize] = useState(0);

  const updateSize = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const windowAspectRatio = windowWidth / windowHeight;

    let height, width;
    if (windowAspectRatio > aspectRatio) {
      // Window is wider than the component aspect ratio
      height = windowHeight;
      width = height * aspectRatio;
    } else {
      // Window is narrower than the component aspect ratio
      width = windowWidth;
      height = width / aspectRatio;
    }
    setFontSize((width / 1300) * 24);
    setComponentSize({ width, height });
  };

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="app-shell relative min-h-screen h-screen w-full overflow-hidden bg-neutral-900">
      <div
        className="table-shell absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-black/40 shadow-2xl bg-cover bg-center bg-no-repeat"
        style={{
          width: `${componentSize.width}px`,
          height: `${componentSize.height}px`,
          fontSize: `${fontSize}px`,
          backgroundImage: "url('./assets/background/backdrop.svg')",
          backgroundColor: '#085C3A',
        }}
      >
        <Game />
      </div>
    </div>
  );
}

export default App;

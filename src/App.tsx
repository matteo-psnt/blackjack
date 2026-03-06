import React, { useEffect, useState } from 'react';
import './styles/index.css';
import Game from './components/Game';

const FINAL_FELT_TEXTURE_STYLE: React.CSSProperties = {
  opacity: 0.65,
  filter: 'contrast(100%) brightness(80%) saturate(120%)',
  mixBlendMode: 'multiply',
  backgroundImage: [
    'url("https://www.transparenttextures.com/patterns/felt.png")',
    'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.025) 0 1px, rgba(0, 0, 0, 0) 1px 7px)',
    'repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.018) 0 1px, rgba(0, 0, 0, 0) 1px 7px)',
  ].join(', '),
  backgroundSize: '164px 164px, 14px 14px, 14px 14px',
  backgroundPosition: 'center, center, center',
  backgroundRepeat: 'repeat, repeat, repeat',
};

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
          backgroundColor: '#0a764b',
        }}
      >
        <div className="table-texture-layer" style={FINAL_FELT_TEXTURE_STYLE} />
        <div className="table-content-layer">
          <Game />
        </div>
      </div>
    </div>
  );
}

export default App;

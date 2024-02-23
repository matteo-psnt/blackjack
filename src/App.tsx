import React, {useEffect, useState} from 'react';
import './styles/App.css';
import Game from "./components/Game";

function App() {
    const aspectRatio = 1300 / 720;
    const [componentSize, setComponentSize] = useState({ width: 0, height: 0 });

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

        setComponentSize({ width, height });
    };

    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
      <div id="main-container">
          <div className="game-container"
              style={{
                  width: `${componentSize.width}px`,
                  height: `${componentSize.height}px`,
              }}
          >
                <Game />
          </div>
      </div>
  );
}

export default App;

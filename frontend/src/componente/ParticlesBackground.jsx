import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticlesBackground() {
  const init = async (main) => {
    await loadFull(main);
  };

  const options = {
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    particles: {
      number: { value: 80 },
      color: { value: '#00ff99' },
      links: {
        enable: true,
        color: '#00ff99',
        distance: 130,
        opacity: 0.5,
      },
      move: { enable: true, speed: 1.2 },
      size: { value: 2.5 },
      opacity: { value: 0.5 },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'grab' },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          links: { opacity: 1 },
        },
      },
    },
  };

  return (
    <Particles
      id="particles-js"
      init={init}
      options={options}
      className="absolute inset-0 z-0"
    />
  );
}

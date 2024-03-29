import React, { useEffect } from 'react';
import { UndercookedGameProps } from './UndercookedArea';
import UndercookedGameScene from './UndercookedGameScene';

export default function UndercookedBoard({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#ffffff',
      parent: 'undercooked-map-container',
      render: { pixelArt: true, powerPreference: 'high-performance' },
      width: 768,
      height: 492,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
        },
      },
    };

    const game = new Phaser.Game(config);
    const newGameScene = new UndercookedGameScene(undercookedAreaController);
    const pauseListener = newGameScene.pause.bind(newGameScene);
    const unPauseListener = newGameScene.resume.bind(newGameScene);
    undercookedAreaController.addListener('ucPause', pauseListener);
    undercookedAreaController.addListener('ucUnPause', unPauseListener);
    game.scene.add('undercookedBoard', newGameScene, true);
  }, [undercookedAreaController]);

  return <div style={{ marginTop: 8 }} id='undercooked-map-container' />;
}

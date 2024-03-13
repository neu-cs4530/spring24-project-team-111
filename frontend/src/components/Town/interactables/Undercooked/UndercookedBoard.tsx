import React, { useEffect } from 'react';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import UndercookedGameScene from './UndercookedGameScene';

export default function UndercookedBoard({
  gameAreaController,
}: {
  gameAreaController: UndercookedAreaController;
}): JSX.Element {
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
    const newGameScene = new UndercookedGameScene(gameAreaController);
    game.scene.add('undercookedBoard', newGameScene, true);
  }, [gameAreaController]);

  return <div style={{ marginTop: 8 }} id='undercooked-map-container' />;
}

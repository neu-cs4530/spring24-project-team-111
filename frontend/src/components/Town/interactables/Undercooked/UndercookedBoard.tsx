import React, { useEffect } from 'react';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import UndercookedGameScene from './UndercookedGameScene';

export default function UndercookedBoard({
  gameAreaController,
}: {
  gameAreaController: UndercookedAreaController;
}): JSX.Element {
  // const controller = useInteractableAreaController<UndercookedAreaController>(interactableID);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#ffffff',
      parent: 'undercooked-map-container',
      render: { pixelArt: true, powerPreference: 'high-performance' },
      width: 760,
      height: 512,
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

  return <div id='undercooked-map-container' />;
}

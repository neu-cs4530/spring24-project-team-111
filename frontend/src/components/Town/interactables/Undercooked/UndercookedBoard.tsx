import React, { useEffect } from 'react';
import { UndercookedGameProps } from './UndercookedArea';
import UndercookedGameScene from './UndercookedGameScene';

/**
 * The UndercookedBoard component renders the Undercooked board i.e. the Phaser Scene for Undercooked.
 * Subscribes to the UndercookedTownController to listen for pause and unpause events.
 * Destroys the scene and removes the listeners when the component unmounts.
 *
 * @param gameAreaController the controller for the Undercooked game
 */
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
    const undercookedTownController = undercookedAreaController.undercookedTownController;

    const pauseListener = newGameScene.pause.bind(newGameScene);
    const unPauseListener = newGameScene.resume.bind(newGameScene);
    undercookedTownController.addListener('ucPause', pauseListener);
    undercookedTownController.addListener('ucUnPause', unPauseListener);

    game.scene.add('undercookedBoard', newGameScene, true);

    return () => {
      game.destroy(true);
      undercookedAreaController.undercookedTownController.removeListener('ucPause', pauseListener);
      undercookedAreaController.undercookedTownController.removeListener(
        'ucUnPause',
        unPauseListener,
      );
    };
  }, [undercookedAreaController]);

  return <div style={{ marginTop: 8 }} id='undercooked-map-container' />;
}

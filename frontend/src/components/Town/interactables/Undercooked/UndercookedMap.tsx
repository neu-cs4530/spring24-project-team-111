import React, { useEffect } from 'react';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import UndercookedGameScene from './UndercookedGameScene';

export default function UndercookedMap({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const controller = useInteractableAreaController<UndercookedAreaController>(interactableID);

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
    const newGameScene = new UndercookedGameScene(controller);
    game.scene.add('undercookedBoard', newGameScene, true);
  }, [controller]);

  return <div id='undercooked-map-container' />;
}

// import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
// import React from 'react';
// import { UndercookedGameState } from '../../../../../../shared/types/CoveyTownSocket';
// import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';

// export default function UndercookedLeaderboard({
//   endingGame,
// }: {
//   endingGame: UndercookedAreaController;
// }): JSX.Element {
//   const winsLossesTiesByPlayer: Record<
//     string,
//     { player1: string | undefined; player2: string | undefined; score: number }
//   > = {};

//   // checking if 5 games are not up
//   if (Object.keys(winsLossesTiesByPlayer).length != 5) {
//     winsLossesTiesByPlayer[endingGame.id] = {
//       player1: endingGame.playerOne?.id,
//       player2: endingGame.playerTwo?.id,
//       score: endingGame.score || 0,
//     };
//   } // check if the game is greater than the current games up
//   else {
//     for (const key in winsLossesTiesByPlayer) {
//       if (winsLossesTiesByPlayer[key].score < endingGame.score) {
//         delete winsLossesTiesByPlayer[key];
//         winsLossesTiesByPlayer[endingGame.id] = {
//           player1: endingGame.playerOne?.id,
//           player2: endingGame.playerTwo?.id,
//           score: endingGame.score || 0,
//         };
//       }
//     }
//   }

//   const rows = Object.keys(winsLossesTiesByPlayer).map(player => winsLossesTiesByPlayer[player]);
//   rows.sort((a, b) => b.score? - a.score);

//   return (
//     <Table>
//       <Thead>
//         <Tr>
//           <th>Player1</th>
//           <th>Player2</th>
//           <th>Score</th>
//         </Tr>
//       </Thead>
//       <Tbody>
//         {rows.map(game => {
//           return (
//             <Tr key={game.player1}>
//               <Td>{game.player2}</Td>
//               <Td>{game.score}</Td>
//             </Tr>
//           );
//         })}
//       </Tbody>
//     </Table>
//   );
// }

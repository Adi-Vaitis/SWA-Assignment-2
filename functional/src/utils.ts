import * as Board from "../src/board";

export function constructIndexOfDesiredPosition<T>(
  board: Board.Board<T>,
  p: Board.Position
): number {
  return p.row * board.width + p.col;
}

export function constructExpectedValues<T>(board: Board.Board<T>): T[] {
  let expectedValues: T[] = [];
  for (let i = 0; i < board.width * board.height; i++) {
    expectedValues.push(board.generator.next());
  }
  return expectedValues;
}

export function positionExistsInBoard<T>(
  board: Board.Board<T>,
  p: Board.Position
): boolean {
  return (
    p.row >= 0 && p.row < board.height && p.col >= 0 && p.col < board.width
  );
}

export function positionsAreInTheSameColumnOrRow(
  p1: Board.Position,
  p2: Board.Position
): boolean {
  return p1.row === p2.row || p1.col === p2.col;
}

export function matchesExist<T>(board: Board.Board<T>, p1: Board.Position, p2: Board.Position): boolean {
    const horizontalMatches: Board.Match<T>[] = [];
    const verticalMatches: Board.Match<T>[] = [];
  
    /// doesnt work needs to make matches correctly 
    for (let row = 0; row < board.height; row++) {
      for (let col = 0; col < board.width; col++) {
        const currentPiece = Board.piece(board, { row, col });
        if (currentPiece !== undefined) {
          // Check for horizontal matches
          if (col < board.width - 2) {
            const nextPiece1 = Board.piece(board, { row, col: col + 1 });
            const nextPiece2 = Board.piece(board, { row, col: col + 2 });
  
            if (currentPiece === nextPiece1 && currentPiece === nextPiece2) {
              horizontalMatches.push({
                matched: currentPiece,
                positions: [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }],
              });
            }
          }
  
          // Check for vertical matches
          if (row < board.height - 2) {
            const nextPiece1 = Board.piece(board, { row: row + 1, col });
            const nextPiece2 = Board.piece(board, { row: row + 2, col });
  
            if (currentPiece === nextPiece1 && currentPiece === nextPiece2) {
              verticalMatches.push({
                matched: currentPiece,
                positions: [{ row, col }, { row: row + 1, col }, { row: row + 2, col }],
              });
            }
          }
        }
      }
    }
  
    // Check if either horizontal or vertical matches array have 3 minimum matches
    if (horizontalMatches.length >= 3 || verticalMatches.length >= 3) {
      return true; // Matches exist
    }
  
    return false; // No matches
  }
  
// export function matchesExist<T>(board: Board<T>): boolean {
//     // Check for horizontal matches
//     for (let row = 0; row < board.height; row++) {
//       for (let col = 0; col < board.width; col++) {
//         const currentPiece = piece(board, { row, col });

//         if (currentPiece !== undefined) {
//           // Check right neighbor
//           if (col < board.width - 2) {
//             const nextPiece1 = piece(board, { row, col: col + 1 });
//             const nextPiece2 = piece(board, { row, col: col + 2 });

//             if (currentPiece === nextPiece1 && currentPiece === nextPiece2) {
//               return true; // Horizontal match found
//             }
//           }

//           // Check down neighbor
//           if (row < board.height - 2) {
//             const nextPiece1 = piece(board, { row: row + 1, col });
//             const nextPiece2 = piece(board, { row: row + 2, col });

//             if (currentPiece === nextPiece1 && currentPiece === nextPiece2) {
//               return true; // Vertical match found
//             }
//           }
//         }
//       }
//     }

//     return false; // No matches found
//   }


// let horizontalAndVerticalNeighbors = [];

//         horizontalAndVerticalNeighbors.push(...[
//           Board.piece(board, { row, col: col + 1 }),
//           Board.piece(board, { row, col: col - 1 }),
//           Board.piece(board, { row, col: col })
//         ]);
//         horizontalAndVerticalNeighbors.push(
//           Board.piece(board, { row, col: col + 2 })
//         );
//         horizontalAndVerticalNeighbors.push(
//           Board.piece(board, { row: row + 1, col })
//         );
//         horizontalAndVerticalNeighbors.push(
//           Board.piece(board, { row: row + 2, col })
//         );
import {
  checkHorizontalMatch,
  checkVerticalMatch,
  constructEffectsForPosition,
  constructIndexOfDesiredPosition,
  effectsAreEqual,
  matchesExist,
  positionExistsInBoard,
  positionsAreInTheSameColumnOrRow,
  swapPieces,
} from "./utils";

export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type Board<T> = {
  generator: Generator<T>;
  width: number;
  height: number;
  board: T[][];
};

export type BoardEvent<T> = {
  kind: "Match" | "Refill";
  match?: Match<T>;
};

export type Effect<T> = {
  kind: "Match" | "Refill";
  match?: Match<T>;
  board?: Board<T>;
};

export type MoveResult<T> = {
  board: Board<T>;
  effects: Effect<T>[];
};

export function positions(board: Board<any>): Position[] {
  let positions: Position[] = [];
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
}

export function create<T>(
  generator: Generator<T>,
  width: number,
  height: number
): Board<T> {
  const board: T[][] = [];

  for (let row = 0; row < height; row++) {
    const newRow: T[] = [];
    for (let col = 0; col < width; col++) {
      newRow.push(generator.next());
    }
    board.push(newRow);
  }

  return {
    generator,
    width,
    height,
    board,
  };
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  if (positionExistsInBoard(board, p)) {
    const index = constructIndexOfDesiredPosition(board, p);
    return board.board.flat()[index];
  } else {
    return undefined;
  }
}

export function canMove<T>(
  board: Board<T>,
  first: Position,
  second: Position
): boolean {
  if (positionsAreInTheSameColumnOrRow(first, second)) {
    const piece1 = piece(board, first);
    const piece2 = piece(board, second);

    if (piece1 !== undefined && piece2 !== undefined) {
      const tempBoard: Board<T> = { ...board };
      const tempPieces = tempBoard.board.flat();
      const index1 = constructIndexOfDesiredPosition(board, first);
      const index2 = constructIndexOfDesiredPosition(board, second);

      const temp = tempPieces[index1];
      tempPieces[index1] = tempPieces[index2];
      tempPieces[index2] = temp;

      if (matchesExist(tempBoard, first, second)) {
        return true;
      }
    }
  }

  return false;
}

export function move<T>(
  generator: Generator<T>,
  board: Board<T>,
  first: Position,
  second: Position
): MoveResult<T> {
  if (!canMove(board, first, second)) {
    return { board, effects: [] };
  }

  let newBoard = {
    ...board,
    board: swapPieces([...board.board], first, second),
  };

  const effects: Effect<T>[] = [];
  let firstPosition = first;
  let secondPosition = second;
  let matchesExists = matchesExist(newBoard, firstPosition, secondPosition);
  while (matchesExists) {
    let newEffects : Effect<T>[] = [
      ...constructEffectsForPosition(newBoard, firstPosition),
      ...constructEffectsForPosition(newBoard, secondPosition)
    ];
    effects.push(...newEffects);

    let positionsMatched: Position[] = [
      ...newEffects.filter((effect) => effect.board !== undefined || effect.match !== undefined).map((effect) => effect.match.positions).flat()
    ]
    // if(effectsForFirstPosition[0].match !== undefined){
    //   positionsMatched.push(...effectsForFirstPosition[0].match.positions);
    // }
    //   ...effectsForSecondPosition[0].match.positions,
    // ];
    newBoard = {
      ...newBoard,
      board: refillBoard(generator, newBoard, positionsMatched).board,
    };
    effects.push({ kind: "Refill" });
    /// TODO implement cascading matches
    matchesExists = false;
    // here we will need to set the first and second position again for cascading effect
    // firstPosition = first;
    // secondPosition = second;
  }
  return { board: newBoard, effects };
}

// function handleCascadingMatches<T>(
//   generator: Generator<T>,
//   board: Board<T>
// ): Effect<T>[] {
//   const cascadeEffects: Effect<T>[] = [];
//   let cascadeOccurred = false;

//   for (let row = 0; row < board.height; row++) {
//     for (let col = 0; col < board.width; col++) {
//       const currentPiece = piece(board, { row, col });
//       if (currentPiece === undefined) continue;

//       const horizontalMatch = matchesExist(
//         board,
//         { row, col },
//         { row, col: col + 1 }
//       );
//       const verticalMatch = matchesExist(
//         board,
//         { row, col },
//         { row: row + 1, col }
//       );

//       if (horizontalMatch || verticalMatch) {
//         board.board.flat()[row * board.width + col] = undefined;

//         const positions: Position[] = [{ row, col }];
//         const matchedPiece = currentPiece;
//         if (horizontalMatch) {
//           positions.push({ row, col: col + 1 });
//         }
//         if (verticalMatch) {
//           positions.push({ row: row + 1, col });
//         }
//         cascadeEffects.push({
//           kind: "Match",
//           match: { matched: matchedPiece, positions },
//         });

//         cascadeOccurred = true;
//       }
//     }
//   }

//   if (cascadeOccurred) {
//     cascadeEffects.push({
//       kind: "Refill",
//       board: refillBoard(generator, board),
//     });
//   }

//   return cascadeEffects;
// }

function refillBoard<T>(
  generator: Generator<T>,
  board: Board<T>,
  matchedPositions: Position[]
): Board<T> {
  const newBoard: T[][] = [];

  for (let row = 0; row < board.height; row++) {
    const newRow: T[] = [];
    for (let col = 0; col < board.width; col++) {
      const currentPosition: Position = { row, col };
      const currentPiece = piece(board, currentPosition);

      if (
        matchedPositions.some((matchedPos) =>
          arePositionsEqual(matchedPos, currentPosition)
        )
      ) {
        // If the current position matches one of the matched positions, replace it with a new piece.
        newRow.push(generator.next());
      } else {
        // Otherwise, keep the current piece.
        newRow.push(currentPiece);
      }
    }
    newBoard.push(newRow);
  }

  return { ...board, board: newBoard };
}

// this shifts the pieces down but the first test won't work, so we need to do it differently for both cases
// function refillBoard<T>(
//   generator: Generator<T>,
//   board: Board<T>,
//   matchedPositions: Position[]
// ): Board<T> {
//   const newBoard: T[][] = [];

//   // Create a new board with the same dimensions, leaving the top row empty.
//   for (let row = 0; row < board.height; row++) {
//     const newRow: T[] = [];
//     for (let col = 0; col < board.width; col++) {
//       if (row === 0) {
//         // Fill the top row with new pieces.
//         newRow.push(generator.next());
//       } else {
//         // Shift every other row down.
//         newRow.push(piece(board, { row: row - 1, col }));
//       }
//     }
//     newBoard.push(newRow);
//   }

//   return { ...board, board: newBoard };
// }

// Helper function to check if two positions are equal.
function arePositionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

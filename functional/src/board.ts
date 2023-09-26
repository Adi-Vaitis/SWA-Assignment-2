import {
  constructExpectedValues,
  constructIndexOfDesiredPosition,
  matchesExist,
  positionExistsInBoard,
  positionsAreInTheSameColumnOrRow,
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
};

export type Effect<T> = {
  kind: "Match" | "Refill";
  match?: Match<T>;
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
  return {
    generator,
    width,
    height,
  };
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  if (positionExistsInBoard(board, p)) {
    const index = constructIndexOfDesiredPosition(board, p);
    const expectedValues = constructExpectedValues(board);

    return expectedValues[index];
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
    // de aici trebuie sa lucrati sa vedeti cum isi poate gasi match-urile
    // folositi utils pentru functii mari si le dati export aici
    // Check if swapping the pieces would result in a match
    const piece1 = piece(board, first);
    const piece2 = piece(board, second);
    
    if (piece1 !== undefined && piece2 !== undefined) {
      // Swap the pieces temporarily
      const tempBoard = { ...board };
      tempBoard[first.row][first.col] = piece2;
      tempBoard[second.row][second.col] = piece1;
      // Check for matches (you'll need to implement this function)
      return matchesExist(tempBoard, first, second);
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
  return undefined;
}

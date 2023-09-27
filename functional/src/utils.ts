import * as Board from "./board";

export function positionExistsInBoard(
  board: Board.Board<any>,
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

export function swapPieces<T>(
  board: T[][],
  p1: Board.Position,
  p2: Board.Position
): T[][] {
  const newBoard = board.map((row) => [...row]);
  const temp = newBoard[p1.row][p1.col];
  newBoard[p1.row][p1.col] = newBoard[p2.row][p2.col];
  newBoard[p2.row][p2.col] = temp;
  return newBoard;
}

export function constructIndexOfDesiredPosition(
  board: Board.Board<any>,
  p: Board.Position
): number {
  return p.row * board.width + p.col;
}

export function matchesExist<T>(
  board: Board.Board<T>,
  p1: Board.Position,
  p2: Board.Position
): boolean {
  return (
    hasMatch(board, p1) ||
    hasMatch(board, p2) ||
    hasMatchAfterSwap(board, p1, p2)
  );
}

function hasMatch<T>(board: Board.Board<T>, p: Board.Position): boolean {
  const piece = board.board[p.row][p.col];
  return (
    checkHorizontalMatch(board, p, piece).length >= 3 ||
    checkVerticalMatch(board, p, piece).length >= 3
  );
}

function hasMatchAfterSwap<T>(
  board: Board.Board<T>,
  p1: Board.Position,
  p2: Board.Position
): boolean {
  const tempBoard = { ...board };
  const tempPieces = swapPieces([...board.board], p1, p2);
  tempBoard.board = tempPieces;
  return hasMatch(tempBoard, p1) || hasMatch(tempBoard, p2);
}

export function checkHorizontalMatch<T>(
  board: Board.Board<T>,
  p: Board.Position,
  piece: T
): Board.Position[] {
  const { row, col } = p;
  let count = 1;
  let left = col - 1;
  let right = col + 1;
  let horizontalMatches = [p];

  while (left >= 0 && board.board[row][left] === piece) {
    count++;
    horizontalMatches.push({ row, col: left });
    left--;
  }

  while (right < board.width && board.board[row][right] === piece) {
    count++;
    horizontalMatches.push({ row, col: right });
    right++;
  }

  return horizontalMatches;
}

export function checkVerticalMatch<T>(
  board: Board.Board<T>,
  p: Board.Position,
  piece: T
): Board.Position[] {
  const { row, col } = p;
  let count = 1;
  let up = row - 1;
  let down = row + 1;
  let verticalMatches = [p];

  while (up >= 0 && board.board[up][col] === piece) {
    count++;
    verticalMatches.push({ row: up, col });
    up--;
  }

  while (down < board.height && board.board[down][col] === piece) {
    count++;
    verticalMatches.push({ row: down, col });
    down++;
  }

  return verticalMatches;
}

export function constructEffectsForPosition<T>(
  board: Board.Board<T>,
  p: Board.Position
): Board.Effect<T>[] {
  let effects: Board.Effect<T>[] = [];
  let piece = Board.piece(board, p);
  let pieceMatchesHorizontally = checkHorizontalMatch(board, p, piece);
  let pieceMatchesVertically = checkVerticalMatch(board, p, piece);

  if(pieceMatchesHorizontally.length >= 3) {
    effects.push({
      kind: "Match",
      match: { matched: piece, positions: pieceMatchesHorizontally },
    });
  }
  if(pieceMatchesVertically.length >= 3) {
    effects.push({
      kind: "Match",
      match: { matched: piece, positions: pieceMatchesVertically },
    })
  }

  return effects;
}

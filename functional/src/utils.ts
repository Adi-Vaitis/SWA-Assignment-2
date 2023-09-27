import { Board, Position } from "./board";

export function positionExistsInBoard(board: Board<any>, p: Position): boolean {
  return (
      p.row >= 0 &&
      p.row < board.height &&
      p.col >= 0 &&
      p.col < board.width
  );
}

export function positionsAreInTheSameColumnOrRow(
    p1: Position,
    p2: Position
): boolean {
  return p1.row === p2.row || p1.col === p2.col;
}

export function swapPieces<T>(board: T[][], p1: Position, p2: Position): T[][] {
  const newBoard = board.map((row) => [...row]);
  const temp = newBoard[p1.row][p1.col];
  newBoard[p1.row][p1.col] = newBoard[p2.row][p2.col];
  newBoard[p2.row][p2.col] = temp;
  return newBoard;
}

export function constructIndexOfDesiredPosition(
    board: Board<any>,
    p: Position
): number {
  return p.row * board.width + p.col;
}

export function matchesExist<T>(
    board: Board<T>,
    p1: Position,
    p2: Position
): boolean {
  return (
      hasMatch(board, p1) || hasMatch(board, p2) || hasMatchAfterSwap(board, p1, p2)
  );
}

function hasMatch<T>(board: Board<T>, p: Position): boolean {
  const piece = board.board[p.row][p.col];
  return (
      checkHorizontalMatch(board, p, piece) ||
      checkVerticalMatch(board, p, piece)
  );
}

function hasMatchAfterSwap<T>(
    board: Board<T>,
    p1: Position,
    p2: Position
): boolean {
  const tempBoard = { ...board };
  const tempPieces = swapPieces([...board.board], p1, p2);
  tempBoard.board = tempPieces;
  return hasMatch(tempBoard, p1) || hasMatch(tempBoard, p2);
}

function checkHorizontalMatch<T>(
    board: Board<T>,
    p: Position,
    piece: T
): boolean {
  const { row, col } = p;
  let count = 1;
  let left = col - 1;
  let right = col + 1;

  while (left >= 0 && board.board[row][left] === piece) {
    count++;
    left--;
  }

  while (right < board.width && board.board[row][right] === piece) {
    count++;
    right++;
  }

  return count >= 3;
}

function checkVerticalMatch<T>(
    board: Board<T>,
    p: Position,
    piece: T
): boolean {
  const { row, col } = p;
  let count = 1;
  let up = row - 1;
  let down = row + 1;

  while (up >= 0 && board.board[up][col] === piece) {
    count++;
    up--;
  }

  while (down < board.height && board.board[down][col] === piece) {
    count++;
    down++;
  }

  return count >= 3;
}

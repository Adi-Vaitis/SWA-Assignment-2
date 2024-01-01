import {findValidMatches, handleCascadeEffect, matchesExists, swapPieces} from "./utils";

export type Generator<T>= { next:() => T }

export type Position = {
  row: number,
  col: number
}

export type Match<T> = {
  matched: T,
  positions: Position[]
}

export type Board<T> = {
  width: number,
  height: number,
  pieces: T[][]
};

export type Effect<T> = {
  kind: "Match" | "Refill",
  board?: Board<T>,
  match?: Match<T>
};

export type MoveResult<T> = {
  board: Board<T>,
  effects: Effect<T>[]
}

export function create<T>(generator: Generator<T>, width: number, height: number): Board<T> {
  return {
    width,
    height,
    pieces: [...new Array(height)].map(_ => [...new Array(width)].map(_ => generator.next()))
  }
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  return board.pieces[p.row] ? board.pieces[p.row][p.col] : undefined
}

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
  if (!piece(board, first) || !piece(board, second))
  {
    return false
  }

  if (first.row !== second.row && first.col !== second.col)
  {
    return false
  }

  let newBoard = swapPieces(board, first, second)
  if (!matchesExists(newBoard, first, newBoard.pieces[first.row][first.col]) && !matchesExists(newBoard, second, newBoard.pieces[second.row][second.col]))
  {
    swapPieces(newBoard, first, second)
    return false
  }

  swapPieces(newBoard, first, second)
  return true;
}

export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
  if (!canMove(board, first, second)) {
    return {
      board,
      effects: []
    }
  }

  let newBoard = swapPieces(board, first, second)

  return {
    board: newBoard,
    effects: handleCascadeEffect(generator, board, [])
  }
}

export function positions<T>(board: Board<T>): Position[]
{
  return board.pieces.flatMap((row, ir) => {
    return row.map((_, ic) => {
      return {
        row: ir,
        col: ic
      }
    })
  })
}
import {Board, Effect, Generator, Match, piece, Position} from "./board";

export const getValidMatches = <T>(board: Board<T>, position: Position, matches: Match<T>[], value: T): Match<T>[] => {
  if (piece(board, {row: position.row + 1, col: position.col}) === value && piece(board, {row: position.row - 1, col: position.col}) === value)
  {
    matches.push({matched: value, positions: [{row: position.row - 1, col: position.col}, {row: position.row, col: position.col}, {row: position.row + 1, col: position.col}]})
  }
  if (piece(board, {row: position.row, col: position.col + 1}) === value && piece(board, {row: position.row, col: position.col - 1}) === value)
  {
    matches.push({matched: value, positions: [{row: position.row, col: position.col - 1}, {row: position.row, col: position.col}, {row: position.row, col: position.col + 1}]})
  }
  if (piece(board, {row: position.row + 1, col: position.col}) === value && piece(board, {row: position.row + 2, col: position.col}) === value)
  {
    matches.push({matched: value, positions: [{row: position.row, col: position.col}, {row: position.row + 1, col: position.col}, {row: position.row + 2, col: position.col}]})
  }
  if (piece(board, {row: position.row, col: position.col + 1}) === value && piece(board, {row: position.row, col: position.col + 2}) === value)
  {
    matches.push({matched: value, positions: [{row: position.row, col: position.col}, {row: position.row, col: position.col + 1}, {row: position.row, col: position.col + 2}]})
  }
  if (piece(board, {row: position.row - 1, col: position.col}) === value && piece(board, {row: position.row - 2, col: position.col}) === value)
  {
    matches.push({matched: value, positions: [{row: position.row - 2, col: position.col}, {row: position.row - 1, col: position.col}, {row: position.row, col: position.col}]})
  }
  if (piece(board, {row: position.row, col: position.col - 1}) === value && piece(board, {row: position.row, col: position.col - 2}) === value)
  {
    matches.push({matched: value, positions: [{row: position.row, col: position.col - 2}, {row: position.row, col: position.col - 1}, {row: position.row, col: position.col}]})
  }

  return matches
}

export const isValidMatch = <T>(board: Board<T>, position: Position, value: T): boolean => {
  return getValidMatches(board, position, [], value).length > 0
}

export const swap = <T>(board: Board<T>, first: Position, second: Position): void => {
  [board.pieces[first.row][first.col], board.pieces[second.row][second.col]] = [board.pieces[second.row][second.col], board.pieces[first.row][first.col]]
}

export const registerMatches = <T>(matches: Match<T>[], effects: Effect<T>[]): Effect<T>[] => {
  matches.forEach((match) => {
    effects = [...effects, {kind: "Match", match}]
  })

  return effects
}

export const getAllMatches = <T>(board: Board<T>, matches: Match<T>[]): Match<T>[] => {
  board.pieces.forEach((row, ir) => {
    row.forEach((_, ic) => {
      if (!matches.some(match => match.positions.some(position => position.row === ir && position.col === ic))) {
        matches = matches.concat(getValidMatches(board, {row : ir, col : ic}, [], board.pieces[ir][ic]))
      }
    })
  })

  return matches
}

export const removeMatches = <T>(board: Board<T>, positions: Position[]): void => {
  board.pieces.forEach((row, ir) => {
    row.forEach((_, ic) => {
      if (positions.some(position => position.row === ir && position.col === ic))
      {
        board.pieces[ir][ic] = undefined;
      }
    })
  })
}

export const refill = <T>(generator: Generator<T>, board: Board<T>): void => {
  board.pieces[0] = board.pieces[0].map(col => {
    if (col === undefined) {
      col = generator.next()
    }

    return col
  })

  shiftTilesDown(board)

  if (board.pieces[0].some(piece => piece === undefined)) {
    refill(generator, board)
  }
}

export const shiftTilesDown = <T>(board: Board<T>): void => {
  board.pieces.forEach((row, ir) => {
    row.forEach((_, ic) => {
      if (ir < board.height-1 && board.pieces[ir][ic] !== undefined && board.pieces[ir+1][ic] === undefined)
      {
        board.pieces[ir+1][ic] = board.pieces[ir][ic]
        board.pieces[ir][ic] = undefined
        shiftTilesDown(board)
      }
    })
  })
}

export const handleNewMatches = <T>(generator: Generator<T>, board: Board<T>, effects: Effect<T>[]): Effect<T>[] => {
  if (getAllMatches(board, []).length) {
    effects = registerMatches(getAllMatches(board, []), effects)
    removeMatches(board, getAllMatches(board, []).flatMap(match => match.positions))
    shiftTilesDown(board);
    refill(generator, board)
    effects = handleNewMatches(generator, board, [...effects, {kind: "Refill", board: board}])
  }

  return effects
}
import {Board, Effect, Generator, Match, piece, Position} from "./board";

export const findValidMatches = <T>(board: Board<T>, position: Position, matches: Match<T>[], value: T): Match<T>[] => {
    if (piece(board, {row: position.row + 1, col: position.col}) === value && piece(board, {
        row: position.row - 1,
        col: position.col
    }) === value) {
        matches.push({
            matched: value,
            positions: [{row: position.row - 1, col: position.col}, {
                row: position.row,
                col: position.col
            }, {row: position.row + 1, col: position.col}]
        })
    }
    if (piece(board, {row: position.row, col: position.col + 1}) === value && piece(board, {
        row: position.row,
        col: position.col - 1
    }) === value) {
        matches.push({
            matched: value,
            positions: [{row: position.row, col: position.col - 1}, {
                row: position.row,
                col: position.col
            }, {row: position.row, col: position.col + 1}]
        })
    }
    if (piece(board, {row: position.row + 1, col: position.col}) === value && piece(board, {
        row: position.row + 2,
        col: position.col
    }) === value) {
        matches.push({
            matched: value,
            positions: [{row: position.row, col: position.col}, {
                row: position.row + 1,
                col: position.col
            }, {row: position.row + 2, col: position.col}]
        })
    }
    if (piece(board, {row: position.row, col: position.col + 1}) === value && piece(board, {
        row: position.row,
        col: position.col + 2
    }) === value) {
        matches.push({
            matched: value,
            positions: [{row: position.row, col: position.col}, {
                row: position.row,
                col: position.col + 1
            }, {row: position.row, col: position.col + 2}]
        })
    }
    if (piece(board, {row: position.row - 1, col: position.col}) === value && piece(board, {
        row: position.row - 2,
        col: position.col
    }) === value) {
        matches.push({
            matched: value,
            positions: [{row: position.row - 2, col: position.col}, {
                row: position.row - 1,
                col: position.col
            }, {row: position.row, col: position.col}]
        })
    }
    if (piece(board, {row: position.row, col: position.col - 1}) === value && piece(board, {
        row: position.row,
        col: position.col - 2
    }) === value) {
        matches.push({
            matched: value,
            positions: [{row: position.row, col: position.col - 2}, {
                row: position.row,
                col: position.col - 1
            }, {row: position.row, col: position.col}]
        })
    }

    return matches;
}

export const matchesExists = <T>(board: Board<T>, position: Position, value: T): boolean => {
    return findValidMatches(board, position, [], value).length > 0;
}

export const swapPieces = <T>(board: Board<T>, first: Position, second: Position): Board<T> => {
    let copiedBoard: Board<T> = deepCopyBoard(board);
    [copiedBoard.pieces[first.row][first.col], copiedBoard.pieces[second.row][second.col]] = [copiedBoard.pieces[second.row][second.col], copiedBoard.pieces[first.row][first.col]]

    return copiedBoard;
}

export const registerMatch = <T>(matches: Match<T>[], effects: Effect<T>[]): Effect<T>[] => {
    matches.forEach((match) => {
        effects = [...effects, {kind: "Match", match}]
    })

    return effects;
}

export const constructAllMatchesFromBoard = <T>(board: Board<T>, matches: Match<T>[]): Match<T>[] => {
    board.pieces.forEach((row, ir) => {
        row.forEach((_, ic) => {
            if (!matches.some(match => match.positions.some(position => position.row === ir && position.col === ic))) {
                matches = matches.concat(findValidMatches(board, {row: ir, col: ic}, [], board.pieces[ir][ic]))
            }
        })
    })

    return matches;
}

export const removeMatchesFromBoard = <T>(board: Board<T>, positions: Position[]): Board<T> => {
    let newBoard = deepCopyBoard(board);
    newBoard.pieces.forEach((row, ir) => {
        row.forEach((_, ic) => {
            if (positions.some(position => position.row === ir && position.col === ic)) {
                newBoard.pieces[ir][ic] = undefined;
            }
        })
    });

    return newBoard;
}

export const handleRefill = <T>(generator: Generator<T>, board: Board<T>): Board<T> => {
    let newBoard: Board<T> = deepCopyBoard(board);

    newBoard.pieces[0] = newBoard.pieces[0].map(col => col === undefined ? generator.next() : col);

    newBoard = shiftTilesDown(newBoard);

    return newBoard.pieces[0].some(col => col === undefined) ? handleRefill(generator, newBoard) : newBoard;
};


export const shiftTilesDown = <T>(board: Board<T>): Board<T> => {
    let newBoard: Board<T> = deepCopyBoard(board);
    let shifted = false;

    newBoard.pieces.forEach((row, indexRow) => {
        row.forEach((_, indexColumn) => {
            if (indexRow < newBoard.height - 1 && newBoard.pieces[indexRow][indexColumn] !== undefined && newBoard.pieces[indexRow + 1][indexColumn] === undefined) {
                newBoard.pieces[indexRow + 1][indexColumn] = newBoard.pieces[indexRow][indexColumn];
                newBoard.pieces[indexRow][indexColumn] = undefined;
                shifted = true;
            }
        });
    });

    return shifted ? shiftTilesDown(newBoard) : newBoard;
};


//recursive function
export const handleCascadeEffect = <T>(generator: Generator<T>, board: Board<T>, effects: Effect<T>[]): Effect<T>[] => {
    let matches = constructAllMatchesFromBoard(board, []);
    if (matches.length > 0) {
        let newEffects = registerMatch(matches, [...effects]);
        let newBoard = removeMatchesFromBoard(board, matches.flatMap(match => match.positions));
        newBoard = shiftTilesDown(newBoard);
        newBoard = handleRefill(generator, newBoard);

        return handleCascadeEffect(generator, newBoard, [...newEffects, { kind: "Refill", board: newBoard }]);
    }

    return effects;
};


export const deepCopyBoard = <T>(board: Board<T>): Board<T> => {
    return JSON.parse(JSON.stringify(board));
}
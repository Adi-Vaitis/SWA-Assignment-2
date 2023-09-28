
export type Generator<T>= { next:() => T }

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = {
    kind: 'Match' | 'Refill';
    match?: Match<T>;
};

type BoardItem<T> = {
    value: T;
    position: Position;
};

export type BoardListener<T> = (event: BoardEvent<T>) => void;

export class Board<T> {
    generator: Generator<T>;
    width: number;
    height: number;
    board: BoardItem<T>[][];
    matchedItems: BoardItem<T>[];
    matchedSequences: BoardItem<T>[][];
    listener: BoardListener<T>;

    constructor(generator: Generator<T>, width: number, height: number) {
        this.generator = generator;
        this.width = width;
        this.height = height;
        this.matchedItems = [];
        this.matchedSequences = [];
        this.board = [...Array(height)].map(() => [...Array(width)]);

        // Initializing the board
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.board[i][j] = {
                    value: generator.next(),
                    position: { row: i, col: j },
                };
            }
        }
    }

    addListener(listener: BoardListener<T>) {
        this.listener = listener;
    }

    piece(p: Position): T | undefined {
        const { row, col } = p;
        if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
            return this.board[row][col].value;
        }
        return undefined;
    }

    canMove(first: Position, second: Position): boolean {
    }

    move(first: Position, second: Position) {
    }
}

export function isValidRow(index: number) {
    return index >= 0 && index < this.height;
}

export function isValidColumn(index: number) {
    return index >= 0 && index < this.width;
}

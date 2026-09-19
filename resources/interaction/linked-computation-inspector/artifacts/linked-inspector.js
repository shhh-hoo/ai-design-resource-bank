function assertGrid(grid) {
  if (!Array.isArray(grid) || !grid.length || !grid.every((row) => Array.isArray(row) && row.length === grid[0].length)) {
    throw new TypeError("grid must be a non-empty rectangular matrix");
  }
}

function assertKernel(kernel) {
  assertGrid(kernel);
  if (kernel.length !== kernel[0].length || kernel.length % 2 === 0) {
    throw new TypeError("kernel must be square with an odd side length");
  }
}

export function neighborhood(grid, row, column, radius, padding = 0) {
  assertGrid(grid);
  const values = [];
  for (let dy = -radius; dy <= radius; dy++) {
    const line = [];
    for (let dx = -radius; dx <= radius; dx++) {
      const y = row + dy, x = column + dx;
      line.push(y >= 0 && y < grid.length && x >= 0 && x < grid[0].length ? grid[y][x] : padding);
    }
    values.push(line);
  }
  return values;
}

export function inspectKernel(grid, kernel, row, column, { padding = 0 } = {}) {
  assertGrid(grid);
  assertKernel(kernel);
  if (!Number.isInteger(row) || !Number.isInteger(column)) throw new TypeError("row and column must be integers");
  if (row < 0 || row >= grid.length || column < 0 || column >= grid[0].length) throw new RangeError("selection is outside the grid");
  const radius = Math.floor(kernel.length / 2);
  const input = neighborhood(grid, row, column, radius, padding);
  const products = input.map((line, y) => line.map((value, x) => value * kernel[y][x]));
  const output = products.flat().reduce((sum, value) => sum + value, 0);
  return {
    selection: { row, column },
    input: { neighborhood: input, kernel },
    operation: { products },
    output,
  };
}

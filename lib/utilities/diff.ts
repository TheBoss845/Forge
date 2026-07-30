/** Minimal line-level diff (LCS-based) for change previews. */

export interface DiffLine {
  kind: "context" | "added" | "removed";
  text: string;
}

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");

  // LCS length table.
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[] = new Array(rows * cols).fill(0);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i * cols + j] =
        a[i] === b[j]
          ? table[(i + 1) * cols + j + 1] + 1
          : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ kind: "context", text: a[i] });
      i += 1;
      j += 1;
    } else if (table[(i + 1) * cols + j] >= table[i * cols + j + 1]) {
      result.push({ kind: "removed", text: a[i] });
      i += 1;
    } else {
      result.push({ kind: "added", text: b[j] });
      j += 1;
    }
  }
  while (i < a.length) {
    result.push({ kind: "removed", text: a[i] });
    i += 1;
  }
  while (j < b.length) {
    result.push({ kind: "added", text: b[j] });
    j += 1;
  }
  return result;
}

/** Collapses long runs of context, keeping `radius` lines around changes. */
export function compactDiff(
  lines: DiffLine[],
  radius = 3,
): Array<DiffLine | { kind: "skip"; count: number }> {
  const keep = new Array<boolean>(lines.length).fill(false);
  lines.forEach((line, index) => {
    if (line.kind !== "context") {
      for (
        let k = Math.max(0, index - radius);
        k <= Math.min(lines.length - 1, index + radius);
        k += 1
      ) {
        keep[k] = true;
      }
    }
  });

  const result: Array<DiffLine | { kind: "skip"; count: number }> = [];
  let skipped = 0;
  lines.forEach((line, index) => {
    if (keep[index]) {
      if (skipped > 0) {
        result.push({ kind: "skip", count: skipped });
        skipped = 0;
      }
      result.push(line);
    } else {
      skipped += 1;
    }
  });
  if (skipped > 0) result.push({ kind: "skip", count: skipped });
  return result;
}

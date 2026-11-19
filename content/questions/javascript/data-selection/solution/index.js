function testCondition(value, condition) {
  if (typeof condition === 'function') return Boolean(condition(value));
  if (Array.isArray(condition)) return condition.includes(value);
  return value === condition;
}

function parseOrderBy(orderBy) {
  const keys = Array.isArray(orderBy) ? orderBy : [orderBy];
  return keys.map((key) =>
    key.startsWith('-') ? { field: key.slice(1), direction: -1 } : { field: key, direction: 1 }
  );
}

function makeComparator(keys) {
  return (rowA, rowB) => {
    for (const { field, direction } of keys) {
      const a = rowA[field];
      const b = rowB[field];
      const aMissing = a === null || a === undefined;
      const bMissing = b === null || b === undefined;
      if (aMissing || bMissing) {
        if (aMissing && bMissing) continue;
        // Missing values sort last regardless of direction.
        return aMissing ? 1 : -1;
      }
      if (a < b) return -direction;
      if (a > b) return direction;
    }
    return 0;
  };
}

/**
 * @param {Array<Record<string, any>>} rows
 * @param {{
 *   where?: Record<string, any>,
 *   orderBy?: string | string[],
 *   offset?: number,
 *   limit?: number,
 *   select?: string[],
 * }} [options]
 * @return {Array<Record<string, any>>}
 */
export default function selectData(rows, options = {}) {
  const { where, orderBy, offset = 0, limit, select } = options;

  const conditions = where ? Object.entries(where) : [];
  // filter() also gives us a copy, so sorting below never mutates `rows`.
  let result = rows.filter((row) => conditions.every(([field, condition]) => testCondition(row[field], condition)));

  if (orderBy !== undefined) {
    // Array.prototype.sort is stable (ES2019+), so ties keep their original order.
    result.sort(makeComparator(parseOrderBy(orderBy)));
  }

  result = result.slice(offset, limit === undefined ? undefined : offset + limit);

  if (select) {
    result = result.map((row) => {
      const projected = {};
      for (const field of select) {
        if (Object.prototype.hasOwnProperty.call(row, field)) projected[field] = row[field];
      }
      return projected;
    });
  }

  return result;
}

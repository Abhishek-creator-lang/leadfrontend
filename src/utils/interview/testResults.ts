/** Sandpack's nested test results (specs → describes → tests), as much as we need of them. */
export interface TestNode {
  tests?: Record<string, { status?: string }>;
  describes?: Record<string, TestNode>;
}

/** Counts passing and total finished tests in Sandpack's nested spec results. */
export function countTests(specs: Record<string, TestNode>): { passed: number; total: number } {
  let passed = 0;
  let total = 0;
  const walk = (node: TestNode) => {
    for (const t of Object.values(node.tests ?? {})) {
      if (t.status === 'pass' || t.status === 'fail') total++;
      if (t.status === 'pass') passed++;
    }
    Object.values(node.describes ?? {}).forEach(walk);
  };
  Object.values(specs).forEach(walk);
  return { passed, total };
}

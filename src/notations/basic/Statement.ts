export type JavaStatement = string | JavaStatementArray;
export default interface JavaStatementArray extends Array<JavaStatement> {}

/**
 * convert [ 'stmt1 {', ['sub-stmt'], '}' ] into string like:
 * 'stmt1 {\n    sub-stmt\n}\n'
 */
export function JavaStatementToString (stmtArr: JavaStatementArray, indenter: (depth: number) => string, depth = 1) {
  let result = '';
  stmtArr.forEach(stmt => {
    if (typeof stmt === 'string') {
      result += `\n${indenter(depth)}${stmt}`;
    } else {
      result += JavaStatementToString(stmt, indenter, depth + 1);
    }
  });
  return result;
}

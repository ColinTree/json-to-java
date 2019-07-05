export type JavaStatement = string | JavaStatementArray;
export default interface JavaStatementArray extends Array<JavaStatement> {}

/**
 * convert [ 'stmt1 {', ['sub-stmt'], '}' ] into string like:
 * 'stmt1 {\n    sub-stmt\n}\n'
 */
export function JavaStatementToString (stmtArr: JavaStatementArray, indentationSize: number, currentIndent: number) {
  const selfIndentation = ' '.repeat(currentIndent);
  let result = '';
  stmtArr.forEach(stmt => {
    if (typeof stmt === 'string') {
      result += `\n${selfIndentation}${stmt}`;
    } else {
      result += JavaStatementToString(stmt, indentationSize, currentIndent + indentationSize);
    }
  });
  return result;
}

import { JsonArray } from '../../utils/json';
import { ConvertOptions } from '../SingleFile';
import JavaStatementBase from './statements/Base';
import JavaStatementIf from './statements/If';
import JavaStatementWhile from './statements/While';

export type JavaStatement = string | JavaStatementBase | JavaStatementArray;
export interface JavaStatementArray extends Array<JavaStatement> {}

export function JsonArrayToJavaStatement (
    statementJson: JsonArray, convertOptions: ConvertOptions, currentIndent: number) {
  const statements = [] as JavaStatementArray;
  statementJson.forEach(statementItem => {
    if (typeof statementItem === 'string') {
      statements.push(statementItem);
    } else if (Array.isArray(statementItem)) {
      statements.push(JsonArrayToJavaStatement(statementItem, convertOptions, currentIndent + 1));
    } else if (typeof statementItem === 'object' && statementItem !== null) {
      switch (statementItem.type) {
        case 'if': {
          statements.push(new JavaStatementIf(convertOptions, currentIndent, statementItem));
          break;
        }
        case 'while': {
          statements.push(new JavaStatementWhile(convertOptions, currentIndent, statementItem));
          break;
        }
        default: {
          throw new Error('Unaccepted type of a statement (in form of JsonObject): ' + statementItem.type);
        }
      }
    } else {
      throw new Error('Unaccepted value type of statement: ' + typeof statementItem);
    }
  });
  return statements;
}

/**
 * convert [ 'stmt1 {', ['sub-stmt'], '}' ] into string like:
 * 'stmt1 {\n    sub-stmt\n}\n'
 */
export function JavaStatementToString (stmtArr: JavaStatementArray, indenter: (depth: number) => string, depth = 1) {
  let result = '';
  stmtArr.forEach(stmt => {
    let isStatmentObject = false;
    if (stmt instanceof JavaStatementBase) {
      isStatmentObject = true;
      stmt = stmt.toJavaStatement();
    }
    if (typeof stmt === 'string') {
      result += `\n${indenter(depth)}${stmt}`;
    } else {
      result += JavaStatementToString(stmt, indenter, depth + (isStatmentObject ? 0 : 1));
    }
  });
  return result;
}

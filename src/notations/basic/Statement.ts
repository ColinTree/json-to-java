import J2JError from '../../utils/J2JError';
import { JsonArray } from '../../utils/json';
import JavaStatementBase from './statements/Base';
import JavaStatementIf from './statements/If';
import JavaStatementWhile from './statements/While';

export type JavaStatement = string | JavaStatementBase | JavaStatementArray;
export interface JavaStatementArray extends Array<JavaStatement> {}

export function parseJavaStatements (receiver: JavaStatement[], statementJson: JsonArray, currentIndent: number) {
  const nameWhenAsEmitter = 'Statement';

  statementJson.forEach((statementItem, index) => {
    if (typeof statementItem === 'string') {
      receiver.push(statementItem);
    } else if (Array.isArray(statementItem)) {
      const subReceiver = [] as JavaStatement[];
      parseJavaStatements(subReceiver, statementItem, currentIndent + 1);
      receiver.push(subReceiver);
    } else if (typeof statementItem === 'object' && statementItem !== null) {
      switch (statementItem.type) {
        case 'if': {
          receiver.push(new JavaStatementIf(currentIndent, statementItem));
          break;
        }
        case 'while': {
          receiver.push(new JavaStatementWhile(currentIndent, statementItem));
          break;
        }
        default: {
          throw new J2JError(nameWhenAsEmitter,
            'Unaccepted type of a statement (in form of JsonObject): ' + statementItem.type);
        }
      }
    } else {
      throw new J2JError(nameWhenAsEmitter, 'JsonType is not accepted in statement: ' + JSON.stringify(statementItem));
    }
  });
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

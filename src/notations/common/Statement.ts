import J2JError from '../../utils/J2JError';
import {JsonArray, JsonUtil} from '../../utils/json';
import JavaStatementBase from './statements/Base';
import JavaStatementIf from './statements/If';
import JavaStatementWhile from './statements/While';

export type JavaStatement = string | JavaStatementBase | JavaStatementArray;
export interface JavaStatementArray extends Array<JavaStatement> {}

export function parseJavaStatements (receiver: JavaStatement[], statementJson: JsonArray, currentIndent: number) {
  const nameWhenAsEmitter = 'Statement';

  statementJson.forEach(statementItem => {
    if (typeof statementItem === 'string') {
      receiver.push(statementItem);
    } else if (JsonUtil.isJsonArray(statementItem)) {
      const subReceiver = [] as JavaStatement[];
      parseJavaStatements(subReceiver, statementItem, currentIndent + 1);
      receiver.push(subReceiver);
    } else if (JsonUtil.isJsonObject(statementItem)) {
      const stmtConstructors = {
        if: JavaStatementIf,
        while: JavaStatementWhile,
      };
      const stmtType = statementItem.type;
      switch (stmtType) {
        case 'if':
        case 'while': {
          receiver.push(new (stmtConstructors[stmtType])(statementItem, currentIndent));
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
    let isStatementObject = false;
    if (stmt instanceof JavaStatementBase) {
      isStatementObject = true;
      stmt = stmt.toJavaStatement();
    }
    if (typeof stmt === 'string') {
      result += `\n${indenter(depth)}${stmt}`;
    } else {
      result += JavaStatementToString(stmt, indenter, depth + (isStatementObject ? 0 : 1));
    }
  });
  return result;
}

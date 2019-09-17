import J2JError from '../../../utils/J2JError';
import { JsonObject } from '../../../utils/json';
import QuickConsole from '../../../utils/QuickConsole';
import { JavaStatementArray, parseJavaStatements } from '../Statement';
import JavaStatementBase from './Base';

export default class JavaStatementWhile extends JavaStatementBase {
  private condition: string;
  private statements: JavaStatementArray = [];

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent);
    this.nameWhenAsEmitter = 'While Statement';

    if ('condition' in json) {
      if (typeof json.condition === 'string') {
        this.condition = json.condition;
      } else {
        throw J2JError.typeError(this, 'condition', String);
      }
    } else {
      throw J2JError.fieldNotDefined(this, 'condition');
    }
    if ('statements' in json) {
      if (Array.isArray(json.statements)) {
        parseJavaStatements(this.statements, json.statements, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField('while', 'statements', Array);
      }
    }
  }

  public toJavaStatement () {
    return [
      `while (${this.condition}) {`,
      this.statements,
      '}',
    ];
  }
}

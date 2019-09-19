import J2JError from '../../../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../../../utils/json';
import QuickConsole from '../../../utils/QuickConsole';
import { JavaStatementArray, parseJavaStatements } from '../Statement';
import JavaStatementBase from './Base';

export default class JavaStatementIf extends JavaStatementBase {
  private condition: string;
  private statements: JavaStatementArray = [];
  private else: JavaStatementIf | JavaStatementArray | null = null;

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent);
    this.nameWhenAsEmitter = 'If Statement';

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
      if (JsonUtil.isJsonArray(json.statements)) {
        parseJavaStatements(this.statements, json.statements as JsonArray, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'statements', Array);
      }
    }
    if ('else' in json) {
      if (JsonUtil.isJsonArray(json.else)) {
        this.else = [];
        parseJavaStatements(this.else, json.else as JsonArray, currentIndent);
      } else
      if (JsonUtil.isJsonObject(json.else)) {
        this.else = new JavaStatementIf(currentIndent, json.else as JsonObject);
      } else {
        // neither JsonObject nor JsonArray, unrecognizable type
        QuickConsole.warnIgnoreField(this, 'else', [ Array, Object ]);
      }
    }
  }

  public toJavaStatement () {
    const rtn = [] as JavaStatementArray;
    rtn.push(`if (${this.condition}) {`);
    rtn.push(this.statements);
    if (this.else === null) {
      rtn.push('}');
    } else if (this.else instanceof JavaStatementIf) {
      rtn.push('} else');
      rtn.push(...this.else.toJavaStatement());
    } else {
      rtn.push('} else {');
      rtn.push(this.else);
      rtn.push('}');
    }
    return rtn;
  }
}

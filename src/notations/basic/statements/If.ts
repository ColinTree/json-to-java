import { JsonObject } from '../../../utils/json';
import { ConvertOptions } from '../../SingleFile';
import { JavaStatementArray, JsonArrayToJavaStatement } from '../Statement';
import JavaStatementBase from './Base';

export default class JavaStatementIf extends JavaStatementBase {
  private condition: string;
  private statements: JavaStatementArray = [];
  private else: JavaStatementIf | JavaStatementArray | null = null;

  public constructor (convertOptions: ConvertOptions, currentIndent: number, json: JsonObject) {
    super(convertOptions, currentIndent);
    if (typeof json.condition !== 'string') {
      throw new Error('Condition of JavaStatementIf should be a string');
    }
    this.condition = json.condition;
    if ('statements' in json && Array.isArray(json.statements)) {
      this.statements.push(...JsonArrayToJavaStatement(json.statements, convertOptions, currentIndent + 1));
    }
    if ('else' in json) {
      if (Array.isArray(json.else)) {
        this.else = JsonArrayToJavaStatement(json.else, convertOptions, currentIndent);
      } else if (typeof json.else === 'object' && json.else !== null) {
        this.else = new JavaStatementIf(convertOptions, currentIndent, json.else);
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

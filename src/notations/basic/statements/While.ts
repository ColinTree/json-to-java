import { JsonObject } from '../../../utils/json';
import { ConvertOptions } from '../../SingleFile';
import { JavaStatementArray, JsonArrayToJavaStatement } from '../Statement';
import JavaStatementBase from './Base';

export default class JavaStatementWhile extends JavaStatementBase {
  private condition: string;
  private statements: JavaStatementArray = [];

  public constructor (convertOptions: ConvertOptions, currentIndent: number, json: JsonObject) {
    super(convertOptions, currentIndent);
    if (typeof json.condition !== 'string') {
      throw new Error('Condition of JavaStatementIf should be a string');
    }
    this.condition = json.condition;
    if ('statements' in json && Array.isArray(json.statements)) {
      this.statements.push(...JsonArrayToJavaStatement(json.statements, convertOptions, currentIndent + 1));
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

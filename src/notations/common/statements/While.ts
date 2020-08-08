import {JsonObject} from '../../../utils/json';
import {JavaStatementArray, parseJavaStatements} from '../Statement';
import JavaStatementBase from './Base';

export default class JavaStatementWhile extends JavaStatementBase {
  private condition!: string;
  private statements!: JavaStatementArray;

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'While Statement');
  }

  public toJavaStatement () {
    return [
      `while (${this.condition}) {`,
      this.statements,
      '}',
    ];
  }

  protected defineFields () {
    super.defineFields();

    // condition
    this.registerFieldMandatory('condition');
    this.handleStringField('condition');

    // statements
    this.statements = [];
    this.registerArrayField('statements', value =>
      parseJavaStatements(this.statements, value, this.currentIndent + 1));
  }
}

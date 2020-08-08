import {JsonObject} from '../../../utils/json';
import {JavaStatementArray, parseJavaStatements} from '../Statement';
import JavaStatementBase from './Base';

export default class JavaStatementIf extends JavaStatementBase {
  private condition!: string;
  private statements!: JavaStatementArray;
  private else!: JavaStatementIf | JavaStatementArray | null;

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'If Statement');
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

  protected defineFields () {
    super.defineFields();

    // condition
    this.registerFieldMandatory('condition');
    this.handleStringField('condition');

    // statements
    this.statements = [];
    this.registerArrayField('statements', value =>
      parseJavaStatements(this.statements, value, this.currentIndent + 1));

    // else
    this.else = null;
    this.registerArrayField('else', value =>
      parseJavaStatements(this.else = [], value, this.currentIndent));
    this.registerObjectField('else', value =>
      (this.else = new JavaStatementIf(value, this.currentIndent)));
  }
}

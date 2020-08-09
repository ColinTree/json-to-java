import Notation from '../../Notation';
import {JsonObject} from '../../utils/json';
import {JavaAccessModifier, JavaAccessModifiers} from './Modifier';
import {JavaStatementArray, JavaStatementToString, parseJavaStatements} from './Statement';
import JavaVariableDefinition from './VariableDefinition';

export default class JavaConstructor extends Notation {
  public accessModifier!: JavaAccessModifier;

  private readonly name!: string;

  private arguments!: JavaVariableDefinition[];
  private statements!: JavaStatementArray;

  public constructor (json: JsonObject, currentIndent: number, className: string) {
    super(json, currentIndent, 'Constructor');
    this.name = className;
  }

  public toString () {
    return '' +
      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      `${this.name} ` +
      `(${this.arguments.join(', ')}) {` +
      JavaStatementToString(this.statements, depth => this.contentIndentString(depth)) +
      `\n${this.currentIndentString}}`;
  }

  protected defineFields () {
    // accessModifier
    this.accessModifier = null;
    this.handleEnumField('accessModifier', JavaAccessModifiers);

    // arguments
    this.arguments = [];
    this.handleObjectArrayField('arguments', JavaVariableDefinition);

    // statements
    this.statements = [];
    this.registerArrayField('statements', value =>
      parseJavaStatements(this.statements, value, this.currentIndent));
  }
}

import Notation from '../../Notation';
import {JsonObject} from '../../utils/json';
import JavaAnnotation from './Annotation';
import {JavaAccessModifier, JavaAccessModifiers, JavaNonAccessModifier, JavaNonAccessModifiers} from './Modifier';
import {JavaStatementArray, JavaStatementToString, parseJavaStatements} from './Statement';
import JavaVariableDefinition from './VariableDefinition';

export default class JavaMethod extends Notation {
  private name!: string;
  private annotations!: JavaAnnotation[];
  private accessModifier!: JavaAccessModifier;
  private nonAccessModifiers!: JavaNonAccessModifier[];
  private type!: string | 'void';
  private arguments!: JavaVariableDefinition[];
  private statements!: JavaStatementArray;

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'Method');
  }

  public toString () {
    return '' +
      this.annotations.join('') +
      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      this.nonAccessModifiers.join(' ') + (this.nonAccessModifiers.length > 0 ? ' ' : '') +
      `${this.type} ` +
      `${this.name} ` +
      `(${this.arguments.join(', ')})` +
      (this.nonAccessModifiers.includes('abstract')
        ? ';'
        : (` {${JavaStatementToString(this.statements, depth => this.contentIndentString(depth))}` +
        `\n${this.currentIndentString}}`)
      );
  }

  protected defineFields () {
    // name
    JavaMethod.HandleMandatoryName(this);

    // annotations
    this.annotations = [];
    this.handleObjectArrayField('annotations', JavaAnnotation);

    // accessModifier
    this.accessModifier = null;
    this.handleEnumField('accessModifier', JavaAccessModifiers);

    // nonAccessModifiers
    this.nonAccessModifiers = [];
    this.handleEnumArrayField('nonAccessModifiers', JavaNonAccessModifiers);

    // type
    this.type = 'void';
    this.handleStringField('type');

    // arguments
    this.arguments = [];
    this.handleObjectArrayField('arguments', JavaVariableDefinition);

    // statements
    this.statements = [];
    this.registerArrayField('statements', value =>
      parseJavaStatements(this.statements, value, this.currentIndent));
  }
}

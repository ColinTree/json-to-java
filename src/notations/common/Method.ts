import Notation from '../../Notation';
import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';
import JavaAnnotation, {parseAnnotations} from './Annotation';
import {JavaAccessModifier, JavaNonAccessModifier, parseNonAccessModifiers} from './Modifier';
import {JavaStatementArray, JavaStatementToString, parseJavaStatements} from './Statement';
import JavaVariableDefinition, {parseVariableDefinitions} from './VariableDefinition';

export function parseMethods (
    emitter: any, fieldName: string, receiver: JavaMethod[], methodJson: JsonArray, currentIndent: number) {
  methodJson.forEach((method, index) => {
    if (JsonUtil.isJsonObject(method)) {
      receiver.push(new JavaMethod(method, currentIndent));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, methodJson.length, Object);
    }
  });
}

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
    this.registerArrayField('annotations', value =>
      parseAnnotations(this, 'annotations', this.annotations, value, this.currentIndent));

    // accessModifier
    this.accessModifier = null;
    JavaMethod.HandleAccessModifier(this);

    // nonAccessModifiers
    this.nonAccessModifiers = [];
    this.registerArrayField('nonAccessModifiers', value =>
      parseNonAccessModifiers(this, 'nonAccessModifiers', this.nonAccessModifiers, value));

    // type
    this.type = 'void';
    this.handleStringField('type');

    // arguments
    this.arguments = [];
    this.registerArrayField('arguments', value =>
      parseVariableDefinitions(this, 'arguments', this.arguments, value, this.currentIndent));

    // statements
    this.statements = [];
    this.registerArrayField('statements', value =>
      parseJavaStatements(this.statements, value, this.currentIndent));
  }
}

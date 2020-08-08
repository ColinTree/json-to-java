import Notation from '../../Notation';
import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';
import {JavaAccessModifier} from './Modifier';
import {JavaStatementArray, JavaStatementToString, parseJavaStatements} from './Statement';
import JavaVariableDefinition, {parseVariableDefinitions} from './VariableDefinition';

export function parseConstructors (
    emitter: any, fieldName: string, className: string, receiver: JavaConstructor[],
    constructorJson: JsonArray, currentIndent: number) {
  constructorJson.forEach((constructor, index) => {
    if (JsonUtil.isJsonObject(constructor)) {
      receiver.push(new JavaConstructor(constructor, currentIndent, className));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, constructorJson.length, Object);
    }
  });
}

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
    JavaConstructor.HandleAccessModifier(this);

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

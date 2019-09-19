import J2JError from '../../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../../utils/json';
import QuickConsole from '../../utils/QuickConsole';
import JavaBaseWithName from '../BaseWithName';
import { isJavaAccessModifier, JavaAccessModifier } from '../basic/Modifier';
import { JavaStatementArray, JavaStatementToString, parseJavaStatements } from '../basic/Statement';
import JavaVariableDifinition, { parseVariableDifinitions } from '../basic/VariableDifinition';

export function parseConstructors (
    emitter: any, fieldName: string, className: string, receiver: JavaClassConstructor[],
    constructorJson: JsonArray, currentIndent: number) {
  constructorJson.forEach((attribute, index) => {
    if (JsonUtil.isJsonObject(attribute)) {
      receiver.push(new JavaClassConstructor(currentIndent + 1, className, attribute as JsonObject));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, constructorJson.length, Object);
    }
  });
}

export default class JavaClassConstructor extends JavaBaseWithName {
  public accessModifier: JavaAccessModifier = null;
  public arguments: JavaVariableDifinition[] = [];
  public statements: JavaStatementArray = [];

  public constructor (currentIndent: number, className: string, json: JsonObject) {
    super(currentIndent, className);
    this.nameWhenAsEmitter = 'Constructor';

    if ('accessModifier' in json) {
      if (isJavaAccessModifier(json.accessModifier)) {
        this.accessModifier = json.accessModifier as JavaAccessModifier;
      } else {
        throw J2JError.valueNotAccepted(this, 'accessModifier', json.accessModifier);
      }
    }
    if ('arguments' in json) {
      if (JsonUtil.isJsonArray(json.arguments)) {
        json.arguments = json.arguments as JsonArray;
        parseVariableDifinitions(this, 'arguments', this.arguments, json.arguments, currentIndent);
      }
    }
    if ('statements' in json) {
      if (JsonUtil.isJsonArray(json.statements)) {
        json.statements = json.statements as JsonArray;
        parseJavaStatements(this.statements, json.statements, currentIndent);
      } else {
        QuickConsole.warnIgnoreField(this, 'statements', Array);
      }
    }
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
}

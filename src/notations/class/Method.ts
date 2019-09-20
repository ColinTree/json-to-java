import J2JError from '../../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../../utils/json';
import QuickConsole from '../../utils/QuickConsole';
import JavaAnnotation, { parseAnnotations } from '../Annotation';
import JavaBaseWithName from '../BaseWithName';
import { isJavaAccessModifier, JavaAccessModifier,
  JavaNonAccessModifier, parseNonAccessModifiers } from '../basic/Modifier';
import { JavaStatementArray, JavaStatementToString, parseJavaStatements } from '../basic/Statement';
import JavaVariableDifinition, { parseVariableDifinitions } from '../basic/VariableDifinition';

export function parseMethods (
    emitter: any, fieldName: string, receiver: JavaClassMethod[], methodJson: JsonArray, currentIndent: number) {
  methodJson.forEach((attribute, index) => {
    if (JsonUtil.isJsonObject(attribute)) {
      receiver.push(new JavaClassMethod(currentIndent, attribute as JsonObject));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, methodJson.length, Object);
    }
  });
}

export default class JavaClassMethod extends JavaBaseWithName {
  public readonly annotations: JavaAnnotation[] = [];
  public readonly accessModifier: JavaAccessModifier = null;
  public readonly nonAccessModifiers: JavaNonAccessModifier[] = [];
  public readonly type: string | 'void' = 'void';
  public readonly arguments: JavaVariableDifinition[] = [];
  public readonly statements: JavaStatementArray = [];

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json.name);
    this.nameWhenAsEmitter = 'Method';

    if ('annotations' in json) {
      if (JsonUtil.isJsonArray(json.annotations)) {
        json.annotations = json.annotations as JsonArray;
        parseAnnotations(this, 'annotations', this.annotations, json.annotations, currentIndent);
      } else {
        QuickConsole.warnIgnoreField(this, 'annotations', Array);
      }
    }
    if ('accessModifier' in json) {
      if (isJavaAccessModifier(json.accessModifier)) {
        this.accessModifier = json.accessModifier as JavaAccessModifier;
      } else {
        throw J2JError.valueNotAccepted(this, 'accessModifier', json.accessModifier);
      }
    }
    if ('nonAccessModifiers' in json) {
      if (JsonUtil.isJsonArray(json.nonAccessModifiers)) {
        json.nonAccessModifiers = json.nonAccessModifiers as JsonArray;
        parseNonAccessModifiers(this, 'nonAccessModifiers', this.nonAccessModifiers, json.nonAccessModifiers);
      } else {
        QuickConsole.warnIgnoreField(this, 'nonAccessModifiers', Array);
      }
    }
    if ('type' in json) {
      if (typeof json.type === 'string') {
        this.type = json.type;
      } else {
        QuickConsole.warnIgnoreField(this, 'type', String);
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
      this.annotations.join('') +
      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      this.nonAccessModifiers.join(' ') + (this.nonAccessModifiers.length > 0 ? ' ' : '') +
      `${this.type} ` +
      `${this.name} ` +
      `(${this.arguments.join(', ')}) {` +
      JavaStatementToString(this.statements, depth => this.contentIndentString(depth)) +
      `\n${this.currentIndentString}}`;
  }
}

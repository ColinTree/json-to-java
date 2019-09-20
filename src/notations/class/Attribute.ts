import J2JError from '../../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../../utils/json';
import QuickConsole from '../../utils/QuickConsole';
import JavaBaseWithName from '../BaseWithName';
import { isJavaAccessModifier, JavaAccessModifier,
  JavaNonAccessModifier, parseNonAccessModifiers } from '../basic/Modifier';

export function parseAttributes (
    emitter: any, fieldName: string, receiver: JavaClassAttribute[], attributeJson: JsonArray, currentIndent: number) {
  attributeJson.forEach((attribute, index) => {
    if (JsonUtil.isJsonObject(attribute)) {
      receiver.push(new JavaClassAttribute(currentIndent, attribute as JsonObject));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, attributeJson.length, Object);
    }
  });
}

export default class JavaClassAttribute extends JavaBaseWithName {
  public readonly accessModifier: JavaAccessModifier = null;
  public readonly nonAccessModifiers: JavaNonAccessModifier[] = [];
  public readonly type: string;
  public readonly value: string | null = null;

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json.name);
    this.nameWhenAsEmitter = 'Attribute';

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
        throw J2JError.typeError(this, 'type', String);
      }
    } else {
      throw J2JError.fieldNotDefined(this, 'type');
    }
    if ('value' in json) {
      if (json.value === null || typeof json.value === 'string') {
        this.value = json.value;
      } else {
        QuickConsole.warnIgnoreField('Attributes', 'value', [ null, String ]);
      }
    }
  }

  public toString () {
    return '' +
      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      this.nonAccessModifiers.join(' ') + (this.nonAccessModifiers.length > 0 ? ' ' : '') +
      this.type + ' ' +
      this.name +
      (this.value !== null ? ` = ${this.value}` : '') +
      ';';
  }
}

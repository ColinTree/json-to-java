import Notation from '../../Notation';
import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';
import {JavaAccessModifier, JavaNonAccessModifier, parseNonAccessModifiers} from './Modifier';

export function parseAttributes (
    emitter: any, fieldName: string, receiver: JavaAttribute[], attributeJson: JsonArray, currentIndent: number) {
  attributeJson.forEach((attribute, index) => {
    if (JsonUtil.isJsonObject(attribute)) {
      receiver.push(new JavaAttribute(attribute, currentIndent));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, attributeJson.length, Object);
    }
  });
}

export default class JavaAttribute extends Notation {
  private name!: string;
  private accessModifier!: JavaAccessModifier;
  private nonAccessModifiers!: JavaNonAccessModifier[];
  private type!: string;
  private value!: string | null;

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'Attribute');
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

  protected defineFields () {
    // name
    JavaAttribute.HandleMandatoryName(this);

    // accessModifier
    this.accessModifier = null;
    JavaAttribute.HandleAccessModifier(this);

    // nonAccessModifiers
    this.nonAccessModifiers = [];
    this.registerArrayField('nonAccessModifiers', value =>
      parseNonAccessModifiers(this, 'nonAccessModifiers', this.nonAccessModifiers, value));

    // type
    this.registerFieldMandatory('type');
    this.handleStringField('type');

    // value
    this.value = null;
    this.handleStringField('value');
  }
}

import Notation from '../../Notation';
import {JsonObject} from '../../utils/json';
import {JavaAccessModifier, JavaAccessModifiers, JavaNonAccessModifier, JavaNonAccessModifiers} from './Modifier';

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
    this.handleEnumField('accessModifier', JavaAccessModifiers);

    // nonAccessModifiers
    this.nonAccessModifiers = [];
    this.handleEnumArrayField('nonAccessModifiers', JavaNonAccessModifiers);

    // type
    this.registerFieldMandatory('type');
    this.handleStringField('type');

    // value
    this.value = null;
    this.handleStringField('value');
  }
}

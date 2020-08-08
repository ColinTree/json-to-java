import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';
import QuickConsole from '../../utils/QuickConsole';
import JavaAttribute, {parseAttributes} from '../common/Attribute';
import JavaConstructor, {parseConstructors} from '../common/Constructor';
import JavaMethod, {parseMethods} from '../common/Method';
import {JavaAccessModifier, JavaNonAccessModifier, parseNonAccessModifiers} from '../common/Modifier';
import JavaEntry from '../Entry';
import JavaEnumConstants, {parseEnumConstants} from './enum/Constants';

export function parseEnums (
    emitter: any, fieldName: string, receiver: JavaEnum[], enumJson: JsonArray, currentIndent: number) {
  enumJson.forEach((en, index) => {
    if (JsonUtil.isJsonObject(en)) {
      receiver.push(new JavaEnum(en, currentIndent));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, enumJson.length, Object);
    }
  });
}

const ALLOWED_ENUM_CONSTRUCTOR_ACCESS_MODIFIERS: JavaAccessModifier[] = [ null, 'private' ];

export default class JavaEnum extends JavaEntry {
  public nonAccessModifiers!: JavaNonAccessModifier[];

  private constants!: JavaEnumConstants[];
  private implements!: string[];
  private attributes!: JavaAttribute[];
  private constructors!: JavaConstructor[];
  private methods!: JavaMethod[];

  public constructor (json: JsonObject, currentIndent?: number) {
    super(json, currentIndent, 'Enum');
  }

  public toString () {
    return '' +
      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      this.nonAccessModifiers.join(' ') + (this.nonAccessModifiers.length > 0 ? ' ' : '') +
      `enum ${this.name} ` +
      (this.implements.length > 0 ? `implements ${this.implements.join(', ')} ` : '') +
      '{' +

      this.constants.join(',') + ';' +

      this.attributes.join('') + (this.attributes.length > 0 ? '\n' : '') +
      this.constructors.join('') + (this.constructors.length > 0 ? '\n' : '') +
      this.methods.join('') + (this.methods.length > 0 ? '\n' : '') +

      `\n${this.currentIndentString}}`;
  }

  protected defineFields () {
    super.defineFields();

    // nonAccessModifiers
    this.nonAccessModifiers = [];
    this.registerArrayField('nonAccessModifiers', value =>
      parseNonAccessModifiers(this, 'nonAccessModifiers', this.nonAccessModifiers, value));

    // constants
    this.constants = [];
    this.registerFieldMandatory('constants');
    const constantHandler = (value: any) =>
      parseEnumConstants(this, 'constants', this.constants, value, this.currentIndent + 1);
    this.registerArrayField('constants', constantHandler);
    this.registerObjectField('constants', constantHandler);

    // implements
    this.implements = [];
    this.registerFieldPreprocessor('implements', value => {
      return JsonUtil.isJsonArray(value) ? value : [ String(value) ];
    });
    this.handleStringArrayField('implements');

    // attributes
    this.attributes = [];
    this.registerArrayField('attributes', value =>
      parseAttributes(this, 'attributes', this.attributes, value, this.currentIndent + 1));

    // constructors
    this.constructors = [];
    this.registerArrayField('constructors', value => {
      parseConstructors(this, 'constructors', this.name, this.constructors, value, this.currentIndent + 1);
      this.constructors.forEach((constructor, index) => {
        if (!ALLOWED_ENUM_CONSTRUCTOR_ACCESS_MODIFIERS.includes(constructor.accessModifier)) {
          QuickConsole.warnElementType(
            this, 'constructors', index, this.constructors.length,
            ALLOWED_ENUM_CONSTRUCTOR_ACCESS_MODIFIERS);
        }
      });
    });

    // methods
    this.methods = [];
    this.registerArrayField('methods', value =>
      parseMethods(this, 'methods', this.methods, value, this.currentIndent + 1));
  }
}

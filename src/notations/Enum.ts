import J2JError from '../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../utils/json';
import QuickConsole from '../utils/QuickConsole';
import {JavaAccessModifier, JavaNonAccessModifier} from './basic/Modifier';
import JavaClassAttribute, {parseAttributes} from './class/Attribute';
import JavaClassConstructor, {parseConstructors} from './class/Constructor';
import JavaClassMethod, {parseMethods} from './class/Method';
import JavaEntry from './Entry';
import JavaEnumConstants, {parseEnumConstants} from './enum/Constants';

export function parseEnums (
    emitter: any, fieldName: string, receiver: JavaEnum[], enumJson: JsonArray, currentIndent: number) {
  enumJson.forEach((enumm, index) => {
    if (JsonUtil.isJsonObject(enumm)) {
      receiver.push(new JavaEnum(currentIndent, enumm));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, enumJson.length, Object);
    }
  });
}

const ALLOWED_ENUM_CONSTRUCTOR_ACCESS_MODIFIERS: JavaAccessModifier[] = [ null, 'private' ];

export default class JavaEnum extends JavaEntry {
  public readonly nonAccessModifiers: JavaNonAccessModifier[] = [];
  public readonly constants: JavaEnumConstants[] = [];
  public readonly implements: string[] = [];

  public readonly attributes: JavaClassAttribute[] = [];
  public readonly constructors: JavaClassConstructor[] = [];
  public readonly methods: JavaClassMethod[] = [];

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json);
    this.nameWhenAsEmitter = 'Enum';

    if ('constants' in json) {
      if (JsonUtil.isJsonArray(json.constants) || JsonUtil.isJsonObject(json.constants)) {
        parseEnumConstants(this, 'constants', this.constants, json.constants, currentIndent + 1);
      }
    } else {
      throw J2JError.fieldNotDefined(this, 'constants');
    }
    if ('implements' in json) {
      if (JsonUtil.isJsonArray(json.implements)) {
        this.implements = json.implements.map((implement, index, impls) => {
          if (typeof implement !== 'string') {
            QuickConsole.warnElementType(this, 'implements', index, impls.length, String);
          }
          return String(implement);
        });
      } else {
        this.implements = [ String(json.implements) ];
      }
    }
    if ('attributes' in json) {
      if (JsonUtil.isJsonArray(json.attributes)) {
        parseAttributes(this, 'attributes', this.attributes, json.attributes, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'attributes', Array);
      }
    }
    if ('constructors' in json) {
      if (JsonUtil.isJsonArray(json.constructors)) {
        parseConstructors(this, 'constructors', this.name, this.constructors, json.constructors, currentIndent + 1);
        this.constructors.forEach((constructor, index) => {
          if (!ALLOWED_ENUM_CONSTRUCTOR_ACCESS_MODIFIERS.includes(constructor.accessModifier)) {
            QuickConsole.warnElementType(
              this, 'constructors', index, this.constructors.length,
              ALLOWED_ENUM_CONSTRUCTOR_ACCESS_MODIFIERS);
          }
        });
      } else {
        QuickConsole.warnIgnoreField(this, 'constructors', Array);
      }
    }
    if ('methods' in json) {
      if (JsonUtil.isJsonArray(json.methods)) {
        parseMethods(this, 'methods', this.methods, json.methods, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'methods', Array);
      }
    }
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
}

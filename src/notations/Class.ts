import J2JError from '../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../utils/json';
import QuickConsole from '../utils/QuickConsole';
import JavaAnnotation, {parseAnnotations} from './Annotation';
import {JavaNonAccessModifier, parseNonAccessModifiers} from './basic/Modifier';
import JavaClassAttribute, {parseAttributes} from './class/Attribute';
import JavaClassConstructor, {parseConstructors} from './class/Constructor';
import JavaClassMethod, {parseMethods} from './class/Method';
import JavaEntry from './Entry';
import JavaEnum, {parseEnums} from './Enum';

export function parseClasses (
    emitter: any, fieldName: string, receiver: JavaClass[], classJson: JsonArray, currentIndent: number) {
  classJson.forEach((claz, index) => {
    if (JsonUtil.isJsonObject(claz)) {
      receiver.push(new JavaClass(currentIndent, claz));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, classJson.length, Object);
    }
  });
}

export default class JavaClass extends JavaEntry {
  public readonly annotations: JavaAnnotation[] = [];
  public readonly nonAccessModifiers: JavaNonAccessModifier[] = [];
  public readonly extends: string | null = null;
  public readonly implements: string[] = [];

  public readonly attributes: JavaClassAttribute[] = [];
  public readonly constructors: JavaClassConstructor[] = [];
  public readonly methods: JavaClassMethod[] = [];
  public readonly innerClasses: JavaClass[] = [];
  public readonly innerEnums: JavaEnum[] = [];

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json);
    this.nameWhenAsEmitter = 'Class';

    if ('annotations' in json) {
      if (JsonUtil.isJsonArray(json.annotations)) {
        parseAnnotations(this, 'annotations', this.annotations, json.annotations, currentIndent);
      } else {
        QuickConsole.warnIgnoreField(this, 'annotations', Array);
      }
    }
    if ('nonAccessModifiers' in json) {
      if (JsonUtil.isJsonArray(json.nonAccessModifiers)) {
        parseNonAccessModifiers(this, 'nonAccessModifiers', this.nonAccessModifiers, json.nonAccessModifiers);
      } else {
        QuickConsole.warnIgnoreField(this, 'nonAccessModifiers', Array);
      }
    }
    if ('extends' in json) {
      if (typeof json.extends === 'string') {
        this.extends = json.extends;
      } else {
        QuickConsole.warnIgnoreField(this, 'extends', String);
      }
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
    if ('classes' in json) {
      QuickConsole.warnDeprecated(this, 'classes', 'innerClasses');
    }
    if ('innerClasses' in json) {
      if (JsonUtil.isJsonArray(json.innerClasses)) {
        parseClasses(this, 'innerClasses', this.innerClasses, json.innerClasses, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'innerClasses', Array);
      }
    }
    if ('innerEnums' in json) {
      if (JsonUtil.isJsonArray(json.innerEnums)) {
        parseEnums(this, 'innerEnums', this.innerEnums, json.innerEnums, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'innerEnums', Array);
      }
    }
  }

  public toString () {
    return '' +
      this.annotations.join('') +

      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      this.nonAccessModifiers.join(' ') + (this.nonAccessModifiers.length > 0 ? ' ' : '') +
      `class ${this.name} ` +
      (this.extends ? `extends ${this.extends} ` : '') +
      (this.implements.length > 0 ? `implements ${this.implements.join(', ')} ` : '') +
      '{' +

      this.attributes.join('') + (this.attributes.length > 0 ? '\n' : '') +
      this.constructors.join('') + (this.constructors.length > 0 ? '\n' : '') +
      this.methods.join('') + (this.methods.length > 0 ? '\n' : '') +
      this.innerClasses.join('') + (this.innerClasses.length > 0 ? '\n' : '') +
      this.innerEnums.join('') + (this.innerEnums.length > 0 ? '\n' : '') +

      `\n${this.currentIndentString}}`;
  }
}

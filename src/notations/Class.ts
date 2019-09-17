import J2JError from '../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../utils/json';
import QuickConsole from '../utils/QuickConsole';
import JavaAnnotation, { parseAnnotations } from './Annotation';
import JavaBaseWithName from './BaseWithName';
import { isJavaAccessModifier, JavaAccessModifier,
  JavaNonAccessModifier, parseNonAccessModifiers } from './basic/Modifier';
import JavaClassAttribute, { parseAttributes } from './class/Attributes';
import JavaClassConstructor, { parseConstructors } from './class/Constructor';
import JavaClassMethod, { parseMethods } from './class/Method';

export function parseClasses (
    emitter: any, fieldName: string, receiver: JavaClass[], classJson: JsonArray, currentIndent: number) {
  classJson.forEach((claz, index) => {
    if (JsonUtil.isJsonObject(claz)) {
      receiver.push(new JavaClass(currentIndent + 1, claz as JsonObject));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, classJson.length, Object);
    }
  });
}

export default class JavaClass extends JavaBaseWithName {
  public readonly annotations: JavaAnnotation[] = [];
  public readonly accessModifier: JavaAccessModifier = null;
  public readonly nonAccessModifiers: JavaNonAccessModifier[] = [];
  public readonly extends: string | null = null;
  public readonly implements: string[] = [];

  public readonly attributes: JavaClassAttribute[] = [];
  public readonly constructors: JavaClassConstructor[] = [];
  public readonly methods: JavaClassMethod[] = [];
  public readonly classes: JavaClass[] = [];

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json.name);
    this.nameWhenAsEmitter = 'Class';

    if ('annotations' in json) {
      if (Array.isArray(json.annotations)) {
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
      if (Array.isArray(json.nonAccessModifiers)) {
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
      if (Array.isArray(json.implements)) {
        const length = json.implements.length;
        json.implements.forEach((implement, index) => {
          if (typeof implement === 'string') {
            QuickConsole.warnElementType(this, 'implements', index, length, String);
          }
          this.implements.push(String(implement));
        });
      } else {
        json.implements = [ json.implements ];
      }
    }
    if ('attributes' in json) {
      if (Array.isArray(json.attributes)) {
        parseAttributes(this, 'attributes', this.attributes, json.attributes, currentIndent);
      } else {
        QuickConsole.warnIgnoreField(this, 'attributes', Array);
      }
    }
    if ('constructors' in json) {
      if (Array.isArray(json.constructors)) {
        parseConstructors(this, 'constructors', this.name, this.constructors, json.constructors, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'constructors', Array);
      }
    }
    if ('methods' in json) {
      if (Array.isArray(json.methods)) {
        parseMethods(this, 'methods', this.methods, json.methods, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'methods', Array);
      }
    }
    if ('classes' in json) {
      if (Array.isArray(json.classes)) {
        parseClasses(this, 'classes', this.classes, json.classes, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'classes', Array);
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
      this.classes.join('') +

      `\n${this.currentIndentString}}`;
  }
}

import { JsonObject, JsonUtil } from '../utils/json';
import JavaAnnotation from './Annotation';
import JavaBaseWithName from './BaseWithName';
import { isJavaAccessModifier, isJavaNonAccessModifier,
  JavaAccessModifier, JavaNonAccessModifier } from './basic/Modifier';
import JavaClassAttribute from './class/Attributes';
import JavaClassConstructor from './class/Constructor';
import JavaClassMethod from './class/Method';
import { ConvertOptions } from './SingleFile';

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

  public constructor (convertOptions: ConvertOptions, currentIndent: number, json: JsonObject) {
    super(convertOptions, currentIndent, json.name);

    if ('annotations' in json && Array.isArray(json.annotations)) {
      this.annotations.push(...json.annotations.map(annotation => {
        if (!JsonUtil.isJsonObject(annotation)) {
          throw this.err('Anontation should be a pure object array');
        }
        try {
          return new JavaAnnotation(convertOptions, currentIndent, annotation as JsonObject);
        } catch (e) {
          throw this.err((e as Error).message);
        }
      }));
    }
    if ('accessModifier' in json) {
      if (json.accessModifier !== null && typeof json.accessModifier !== 'string') {
        throw this.err('accessModifier should be null or string');
      }
      if (!isJavaAccessModifier(json.accessModifier)) {
        throw this.err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      this.accessModifier = json.accessModifier as JavaAccessModifier;
    }
    if ('nonAccessModifiers' in json && Array.isArray(json.nonAccessModifiers)) {
      this.nonAccessModifiers.push(...json.nonAccessModifiers.map(nonAccessModifier => {
        if (!isJavaNonAccessModifier(nonAccessModifier)) {
          throw this.err(`nonAccessModifier '${nonAccessModifier}' cannot be accepted`);
        }
        return nonAccessModifier as JavaNonAccessModifier;
      }));
    }
    if ('extends' in json && typeof json.extends === 'string') {
      this.extends = json.extends;
    }
    if ('implements' in json && Array.isArray(json.implements)) {
      this.implements.push(...json.implements.map(implement => {
        if (typeof implement !== 'string') {
          throw this.err('implements should be a strign array');
        }
        return implement;
      }));
    }
    if ('attributes' in json && Array.isArray(json.attributes)) {
      this.attributes.push(...json.attributes.map(attribute => {
        if (!JsonUtil.isJsonObject(attribute)) {
          throw this.err('attributes should be a object array');
        }
        try {
          return new JavaClassAttribute(convertOptions, currentIndent + 1, attribute as JsonObject);
        } catch (e) {
          throw this.err((e as Error).message);
        }
      }));
    }
    if ('constructors' in json && Array.isArray(json.constructors)) {
      this.constructors.push(...json.constructors.map(constructor => {
        if (!JsonUtil.isJsonObject(constructor)) {
          throw this.err('constructors should be a object array');
        }
        try {
          return new JavaClassConstructor(convertOptions, currentIndent + 1, this.name, constructor as JsonObject);
        } catch (e) {
          throw this.err((e as Error).message);
        }
      }));
    }
    if ('methods' in json && Array.isArray(json.methods)) {
      this.methods.push(...json.methods.map(method => {
        if (!JsonUtil.isJsonObject(method)) {
          throw this.err('methods should be a object array');
        }
        try {
          return new JavaClassMethod(convertOptions, currentIndent + 1, method as JsonObject);
        } catch (e) {
          throw this.err((e as Error).message);
        }
      }));
    }
    if ('classes' in json && Array.isArray(json.classes)) {
      this.classes.push(...json.classes.map(claz => {
        if (!JsonUtil.isJsonObject(claz)) {
          throw this.err('classes should be a object array');
        }
        try {
          return new JavaClass(convertOptions, currentIndent + 1, claz as JsonObject);
        } catch (e) {
          throw this.err((e as Error).message);
        }
      }));
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

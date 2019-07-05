import { JAVA_NAME_VALIDTOR } from '../utils/consts';
import { JsonObject } from '../utils/json';
import JavaAnnotation from './Annotation';
import JavaConvertable from './basic/JavaConvertable';
import { isJavaAccessModifier, isJavaNonAccessModifier,
  JavaAccessModifier, JavaNonAccessModifier } from './basic/Modifier';
import JavaClassAttribute from './class/Attributes';
import JavaClassConstructor from './class/Constructor';
import JavaClassMethod from './class/Method';

export default class JavaClass implements JavaConvertable {
  public annotations: JavaAnnotation[] = [];
  public accessModifier: JavaAccessModifier = null;
  public nonAccessModifiers: JavaNonAccessModifier[] = [];
  public name: string = '';
  public extends: string | null = null;
  public implements: string[] = [];

  public attributes: JavaClassAttribute[] = [];
  public constructors: JavaClassConstructor[] = [];
  public methods: JavaClassMethod[] = [];
  public classes: JavaClass[] = [];

  public constructor (json: JsonObject) {
    if (!('name' in json) || typeof json.name !== 'string') {
      throw new Error('Class should have a name');
    }
    this.name = json.name;
    if (!JAVA_NAME_VALIDTOR.test(this.name)) {
      throw new Error(`Class name invalid: ${this.name}`);
    }

    const err = (message: string) => new Error(`[Class ${this.name}] ${message}`);
    if ('annotations' in json && Array.isArray(json.annotations)) {
      this.annotations.push(...json.annotations.map(annotation => {
        if (typeof annotation !== 'object' || Array.isArray(annotation)) {
          throw err('Anontation should be a pure object array');
        }
        try {
          return new JavaAnnotation(annotation);
        } catch (e) {
          throw err((e as Error).message);
        }
      }));
    }
    if ('accessModifier' in json) {
      if (json.accessModifier !== null && typeof json.accessModifier !== 'string') {
        throw err('accessModifier should be null or string');
      }
      if (!isJavaAccessModifier(json.accessModifier)) {
        throw err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      this.accessModifier = json.accessModifier as JavaAccessModifier;
    }
    if ('nonAccessModifiers' in json && Array.isArray(json.nonAccessModifiers)) {
      this.nonAccessModifiers.push(...json.nonAccessModifiers.map(nonAccessModifier => {
        if (typeof nonAccessModifier !== 'string' || !isJavaNonAccessModifier(nonAccessModifier)) {
          throw err(`nonAccessModifier '${nonAccessModifier}' cannot be accepted`);
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
          throw err('implements should be a strign array');
        }
        return implement;
      }));
    }
    if ('attributes' in json && Array.isArray(json.attributes)) {
      this.attributes.push(...json.attributes.map(attribute => {
        if (typeof attribute !== 'object' && Array.isArray(attribute)) {
          throw err('attributes should be a object array');
        }
        try {
          return new JavaClassAttribute(attribute as JsonObject);
        } catch (e) {
          throw err((e as Error).message);
        }
      }));
    }
    if ('constructors' in json && Array.isArray(json.constructors)) {
      this.constructors.push(...json.constructors.map(constructor => {
        if (typeof constructor !== 'object' && Array.isArray(constructor)) {
          throw err('constructors should be a object array');
        }
        try {
          return new JavaClassConstructor(this.name, constructor as JsonObject);
        } catch (e) {
          throw err((e as Error).message);
        }
      }));
    }
    if ('methods' in json && Array.isArray(json.methods)) {
      this.methods.push(...json.methods.map(method => {
        if (typeof method !== 'object' && Array.isArray(method)) {
          throw err('methods should be a object array');
        }
        try {
          return new JavaClassMethod(method as JsonObject);
        } catch (e) {
          throw err((e as Error).message);
        }
      }));
    }
    if ('classes' in json && Array.isArray(json.classes)) {
      this.classes.push(...json.classes.map(claz => {
        if (typeof claz !== 'object' && Array.isArray(claz)) {
          throw err('classes should be a object array');
        }
        try {
          return new JavaClass(claz as JsonObject);
        } catch (e) {
          throw err((e as Error).message);
        }
      }));
    }
  }

  public toJava (indentationSize: number, currentIndent: number) {
    const selfIndentation = ' '.repeat(currentIndent);
    const contentIndentation = ' '.repeat(currentIndent + indentationSize);
    let result = '';
    this.annotations.forEach(annotation => {
      result += annotation.toJava(indentationSize, currentIndent);
      result += ' '.repeat(currentIndent);
    });
    result += `\n${selfIndentation}`;
    if (this.accessModifier !== null) {
      result += `${this.accessModifier} `;
    }
    this.nonAccessModifiers.forEach(nonAccessModifier => {
      result += `${nonAccessModifier} `;
    });
    result += `class ${this.name} `;
    if (this.extends !== null) {
      result += `extends ${this.extends} `;
    }
    if (this.implements.length > 0) {
      result += 'implements ';
      result += this.implements.join(', ');
      result += ' ';
    }
    result += '{';
    this.attributes.forEach(attribute => {
      result += attribute.toJava(indentationSize, currentIndent + indentationSize);
    });
    if (this.attributes.length > 0) {
      result += '\n';
    }
    this.constructors.forEach(constructor => {
      result += constructor.toJava(indentationSize, currentIndent + indentationSize);
    });
    if (this.constructors.length > 0) {
      result += '\n';
    }
    this.methods.forEach(method => {
      result += method.toJava(indentationSize, currentIndent + indentationSize);
    });
    if (this.methods.length > 0) {
      result += '\n';
    }
    this.classes.forEach(claz => {
      result += claz.toJava(indentationSize, currentIndent + indentationSize);
    });
    result += `\n${selfIndentation}}`;
    return result;
  }
}

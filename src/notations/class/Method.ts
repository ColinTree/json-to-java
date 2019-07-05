import { JAVA_NAME_VALIDTOR } from '../../utils/consts';
import { JsonObject } from '../../utils/json';
import JavaAnnotation from '../Annotation';
import JavaConvertable from '../basic/JavaConvertable';
import { isJavaAccessModifier, isJavaNonAccessModifier,
  JavaAccessModifier, JavaNonAccessModifier } from '../basic/Modifier';
import JavaStatementArray, { JavaStatementToString } from '../basic/Statement';
import JavaVariableDifinition from '../basic/VariableDifinition';

export default class JavaClassMethod implements JavaConvertable {
  public annotations: JavaAnnotation[] = [];
  public accessModifier: JavaAccessModifier = null;
  public nonAccessModifiers: JavaNonAccessModifier[] = [];
  public type: string | 'void' = 'void';
  public name: string = '';
  public arguments: JavaVariableDifinition[] = [];
  public statements: JavaStatementArray = [];

  public constructor (json: JsonObject) {
    if (!('name' in json) || typeof json.name !== 'string') {
      throw new Error('Method should have a name');
    }
    this.name = json.name;
    if (!JAVA_NAME_VALIDTOR.test(this.name)) {
      throw new Error(`Method name invalid: ${this.name}`);
    }

    const err = (message: string) => new Error(`[Method ${this.name}] ${message}`);
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
        throw err(`accessModifier '${json.accessModifier}' connot be accepted`);
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
    if ('type' in json && typeof json.type === 'string') {
      this.type = json.type;
    }
    if ('arguments' in json && Array.isArray(json.arguments)) {
      this.arguments.push(...json.arguments.map(argument => {
        if (typeof argument !== 'object' && Array.isArray(argument)) {
          throw err('arguments should be a object array');
        }
        try {
          return new JavaVariableDifinition(argument as JsonObject);
        } catch (e) {
          throw err((e as Error).message);
        }
      }));
    }
    if ('statements' in json && Array.isArray(json.statements)) {
      // TODO: check this
      this.statements.push(...json.statements as JavaStatementArray);
    }
  }

  public toJava (indentationSize: number, currentIndent: number) {
    const selfIndentation = ' '.repeat(currentIndent);
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
    result += `${this.type} ${this.name} (`;
    this.arguments.forEach(argument => {
      if (argument.value !== null) {
        throw new Error(`[Method ${this.name}] Argument of method should not have an value defined`);
      }
    });
    result += this.arguments.map(argument => argument.toJava()).join(', ');
    result += ') {';
    result += JavaStatementToString(this.statements, indentationSize, currentIndent + indentationSize);
    result += `\n${selfIndentation}}`;
    return result;
  }
}

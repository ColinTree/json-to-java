import { JsonObject } from '../../utils/json';
import JavaConvertable from '../basic/JavaConvertable';
import { isJavaAccessModifier, JavaAccessModifier } from '../basic/Modifier';
import JavaStatementArray, { JavaStatementToString } from '../basic/Statement';
import JavaVariableDifinition from '../basic/VariableDifinition';

export default class JavaClassConstructor implements JavaConvertable {
  public accessModifier: JavaAccessModifier = null;
  public name: string = '';
  public arguments: JavaVariableDifinition[] = [];
  public statements: JavaStatementArray = [];

  public constructor (className: string, json: JsonObject) {
    this.name = className;
    if ('accessModifier' in json) {
      if (json.accessModifier !== null && typeof json.accessModifier !== 'string') {
        throw new Error(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      if (!isJavaAccessModifier(json.accessModifier)) {
        throw new Error(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      this.accessModifier = json.accessModifier as JavaAccessModifier;
    }
    if ('arguments' in json && Array.isArray(json.arguments)) {
      this.arguments.push(...json.arguments.map(argument => {
        if (typeof argument !== 'object' && Array.isArray(argument)) {
          throw new Error('arguments should be a object array');
        }
        try {
          return new JavaVariableDifinition(argument as JsonObject);
        } catch (e) {
          throw new Error((e as Error).message);
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
    let result = `\n${selfIndentation}`;
    if (this.accessModifier !== null) {
      result += `${this.accessModifier} `;
    }
    result += `${this.name} (`;
    this.arguments.forEach(argument => {
      if (argument.value !== null) {
        throw new Error('Argument of constructor should not have an value defined');
      }
    });
    result += this.arguments.map(argument => argument.toJava()).join(', ');
    result += ') {';
    result += JavaStatementToString(this.statements, indentationSize, currentIndent + indentationSize);
    result += `\n${selfIndentation}}`;
    return result;
  }
}

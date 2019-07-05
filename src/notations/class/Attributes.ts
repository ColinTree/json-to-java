import { JAVA_NAME_VALIDTOR } from '../../utils/consts';
import { JsonObject } from '../../utils/json';
import JavaConvertable from '../basic/JavaConvertable';
import { isJavaAccessModifier, isJavaNonAccessModifier,
  JavaAccessModifier, JavaNonAccessModifier } from '../basic/Modifier';

export default class JavaClassAttribute implements JavaConvertable {
  public accessModifier: JavaAccessModifier = null;
  public nonAccessModifiers: JavaNonAccessModifier[] = [];
  public type: string = '';
  public name: string = '';
  public value: string | null = null;

  public constructor (json: JsonObject) {
    if (!('name' in json) || typeof json.name !== 'string') {
      throw new Error('Attribute should have a name');
    }
    this.name = json.name;
    if (!JAVA_NAME_VALIDTOR.test(this.name)) {
      throw new Error(`VariableDifinition name invalid: ${this.name}`);
    }

    const err = (message: string) => new Error(`[Attribute ${this.name}] ${message}`);
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
    if (!('type' in json) || typeof json.type !== 'string') {
      throw err('VariableDifinition requires a type');
    }
    this.type = json.type;
    if ('value' in json && (json.value === null || typeof json.value === 'string')) {
      this.value = json.value;
    }
  }

  public toJava (indentationSize: number, currentIndent: number) {
    const selfIndentation = ' '.repeat(currentIndent);
    let result = `\n${selfIndentation}`;
    if (this.accessModifier !== null) {
      result += `${this.accessModifier} `;
    }
    this.nonAccessModifiers.forEach(nonAccessModifier => {
      result += `${nonAccessModifier} `;
    });
    result += `${this.type} ${this.name} `;
    if (this.value !== null) {
      result += `= ${this.value}`;
    }
    result += ';';
    return result;
  }
}

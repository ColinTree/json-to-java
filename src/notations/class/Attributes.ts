import { JsonObject } from '../../utils/json';
import JavaBaseWithName from '../BaseWithName';
import { isJavaAccessModifier, isJavaNonAccessModifier,
  JavaAccessModifier, JavaNonAccessModifier } from '../basic/Modifier';
import { ConvertOptions } from '../SingleFile';

export default class JavaClassAttribute extends JavaBaseWithName {
  public readonly accessModifier: JavaAccessModifier = null;
  public readonly nonAccessModifiers: JavaNonAccessModifier[] = [];
  public readonly type: string;
  public readonly value: string | null = null;

  public constructor (convertOptions: ConvertOptions, currentIndent: number, json: JsonObject) {
    super(convertOptions, currentIndent, json.name);

    if ('accessModifier' in json) {
      if (json.accessModifier !== null && typeof json.accessModifier !== 'string') {
        throw this.err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      if (!isJavaAccessModifier(json.accessModifier)) {
        throw this.err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      this.accessModifier = json.accessModifier as JavaAccessModifier;
    }
    if ('nonAccessModifiers' in json && Array.isArray(json.nonAccessModifiers)) {
      this.nonAccessModifiers.push(...json.nonAccessModifiers.map(nonAccessModifier => {
        if (typeof nonAccessModifier !== 'string' || !isJavaNonAccessModifier(nonAccessModifier)) {
          throw this.err(`nonAccessModifier '${nonAccessModifier}' cannot be accepted`);
        }
        return nonAccessModifier as JavaNonAccessModifier;
      }));
    }
    if (!('type' in json) || typeof json.type !== 'string') {
      throw this.err('requires a type');
    }
    this.type = json.type;
    if ('value' in json && (json.value === null || typeof json.value === 'string')) {
      this.value = json.value;
    }
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
}

import { JAVA_NAME_VALIDTOR } from '../utils/consts';
import { JsonObject } from '../utils/json';
import JavaConvertable from './basic/JavaConvertable';

export default class JavaAnnotation implements JavaConvertable {
  public name: string = '';
  public values: { [key: string]: string } | string | null = null;

  public constructor (json: JsonObject) {
    if (!('name' in json) || typeof json.name !== 'string') {
      throw new Error('Anontation should have a name');
    }
    this.name = json.name;
    if (!JAVA_NAME_VALIDTOR.test(this.name)) {
      throw new Error(`Annotation name invalid: ${this.name}`);
    }

    if ('values' in json) {
      if (typeof json.values === 'string') {
        this.values = json.values;
      } else
      if (!Array.isArray(json.values) && (typeof json.values === 'object')) {
        this.values = {};
        for (const key in json.values) {
          const value = json.values[key];
          if (typeof value !== 'string') {
            throw new Error('Anontation values should be an object that both key & value are string');
          }
          this.values[key] = value;
        }
      }
    }
  }

  public toJava (indentationSize: number, currentIndent: number) {
    const selfIndentation = ' '.repeat(currentIndent);
    const contentIndentation = ' '.repeat(currentIndent + indentationSize);
    let result = `\n${selfIndentation}`;
    result += `@${this.name}`;
    if (this.values === null) {
      // skip
    } else if (typeof this.values === 'string') {
      result += '(';
      result += this.values;
      result += ')';
    } else { // if (case key-value object)
      if (Object.keys(this.values).length === 1) {
        const key = Object.keys(this.values)[0];
        result += `(${key} = ${this.values[key]})`;
      } else {
        result += `(\n${contentIndentation}`;
        const args = [];
        for (const key in this.values) {
          args.push(`${key} = ${this.values[key]}`);
        }
        result += args.join(`,\n${contentIndentation}`);
        result += ')';
      }
    }
    return result;
  }
}

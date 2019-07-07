import { JsonObject } from '../utils/json';
import JavaBaseWithName from './BaseWithName';
import { ConvertOptions } from './SingleFile';

export default class JavaAnnotation extends JavaBaseWithName {
  public readonly values: { [key: string]: string } | string | null = null;

  public constructor (convertOptions: ConvertOptions, currentIndent: number, json: JsonObject) {
    super(convertOptions, currentIndent, json.name);

    if ('values' in json) {
      if (typeof json.values === 'string') {
        this.values = json.values;
      } else
      if (typeof json.values === 'object' && !Array.isArray(json.values) && json.values !== null) {
        const values = json.values;
        const thisValues = {} as { [key: string]: string };
        Object.keys(values).map(key => {
          const value = values[key];
          if (typeof value !== 'string') {
            throw new Error('Anontation values should be an object that both key & value are string');
          }
          thisValues[key] = value;
        });
        this.values = thisValues;
      }
    }
  }

  public toString () {
    return '' +
      `\n${this.currentIndentString}` +
      `@${this.name}` +
      this.valuesString();
  }
  private valuesString () {
    if (this.values === null) {
      return '';

    } else if (typeof this.values === 'string') {
      return `(${this.values})`;

    } else { // if (is key-value object)
      if (Object.keys(this.values).length === 1) {
        const key = Object.keys(this.values)[0];
        return `(${key} = ${this.values[key]})`;
      } else {
        return '' +
          `(\n${this.contentIndentString()}` +
          Object.keys(this.values)
                        .map(key => `${key} = ${(this.values as { [key: string]: string })[key]}`)
                        .join(`,\n${this.contentIndentString()}`) +
          ')';
      }
    }
  }
}

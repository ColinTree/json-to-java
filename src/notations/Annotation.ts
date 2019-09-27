import Lodash, { Dictionary } from 'lodash';
import J2JError from '../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../utils/json';
import QuickConsole from '../utils/QuickConsole';
import JavaBaseWithName from './BaseWithName';

export function parseAnnotations (
    emitter: any, fieldName: string, receiver: JavaAnnotation[], annotationJson: JsonArray, currentIndent: number) {
  annotationJson.forEach((annotation, index) => {
    if (JsonUtil.isJsonObject(annotation)) {
      receiver.push(new JavaAnnotation(currentIndent, annotation));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, annotationJson.length, Object);
    }
  });
}

export default class JavaAnnotation extends JavaBaseWithName {
  public readonly values: Dictionary<string> | string | null = null;

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json.name);
    this.nameWhenAsEmitter = 'Annotation';

    if ('values' in json) {
      if (typeof json.values === 'string') {
        this.values = json.values;
      } else if (JsonUtil.isJsonObject(json.values)) {
        this.values = Lodash.mapValues(json.values, (value, key) => {
          if (typeof value !== 'string') {
            QuickConsole.warnValueTypeOfKey(this, 'values', key, String);
            return String(value);
          }
          return value;
        });
      } else {
        QuickConsole.warnIgnoreField(this, 'values', [ String, Object ]);
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
                        .map(key => `${key} = ${(this.values as Dictionary<string>)[key]}`)
                        .join(`,\n${this.contentIndentString()}`) +
          ')';
      }
    }
  }
}

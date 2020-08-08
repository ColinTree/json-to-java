import {Dictionary} from 'lodash';
import Notation from '../../Notation';
import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';

export function parseAnnotations (
    emitter: any, fieldName: string, receiver: JavaAnnotation[], annotationJson: JsonArray, currentIndent: number) {
  annotationJson.forEach((annotation, index) => {
    if (JsonUtil.isJsonObject(annotation)) {
      receiver.push(new JavaAnnotation(annotation, currentIndent));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, annotationJson.length, Object);
    }
  });
}

export default class JavaAnnotation extends Notation {
  private name!: string;
  private values!: Dictionary<string> | string | null;

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'Annotation');
  }

  public toString () {
    return '' +
      `\n${this.currentIndentString}` +
      `@${this.name}` +
      this.valuesString();
  }

  protected defineFields () {
    // name
    JavaAnnotation.HandleMandatoryName(this);

    // values
    this.values = null;
    this.handleStringField('values');
    this.handleStringObjectField('values');
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

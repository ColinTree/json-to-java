import J2JError from '../../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../../utils/json';
import QuickConsole from '../../utils/QuickConsole';
import JavaBaseWithName from '../BaseWithName';

export function parseVariableDifinitions (
    emitter: any, fieldName: string, receiver: JavaVariableDifinition[], argumentJson: JsonArray,
    currentIndent: number) {
  argumentJson.forEach((argument, index) => {
    if (!JsonUtil.isJsonObject(argument)) {
      throw J2JError.elementTypeError(emitter, fieldName, index, length, Object);
    }
    receiver.push(new JavaVariableDifinition(currentIndent, argument as JsonObject));
  });
}

export default class JavaVariableDifinition extends JavaBaseWithName {
  public readonly final: boolean = false;
  public readonly type: string = '';

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json.name);
    this.nameWhenAsEmitter = 'VariableDifinition';

    if ('final' in json) {
      if (typeof json.final === 'boolean') {
        this.final = json.final;
      } else {
        QuickConsole.warnIgnoreField(this, 'final', Boolean);
      }
    }
    if ('type' in json) {
      if (typeof json.type === 'string') {
        this.type = json.type;
      } else {
        throw J2JError.typeError(this, 'type', String);
      }
    } else {
      throw J2JError.fieldNotDefined(this, 'type');
    }
  }

  public toString () {
    return `${this.final ? 'final ' : ''}${this.type} ${this.name}`;
  }
}

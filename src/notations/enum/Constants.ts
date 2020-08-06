import Lodash from 'lodash';
import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';
import QuickConsole from '../../utils/QuickConsole';
import JavaBaseWithName from '../BaseWithName';
import JavaClassMethod, {parseMethods} from '../class/Method';

export function parseEnumConstants (emitter: any, fieldName: string,
                                    receiver: JavaEnumConstants[],
                                    constantJson: JsonArray | JsonObject,
                                    currentIndent: number) {
  if (JsonUtil.isJsonObject(constantJson)) {
    Lodash.forOwn(constantJson, (value, name) => {
      if (JsonUtil.isJsonObject(value)) {
        receiver.push(new JavaEnumConstants(currentIndent, name, value));
      } else {
        QuickConsole.warnValueTypeOfKey(emitter, fieldName, name, Object);
      }
    });
  } else {
    constantJson.forEach((constant, index) => {
      if (typeof constant === 'string') {
        receiver.push(new JavaEnumConstants(currentIndent, constant, { name: constant }));
      } else if (JsonUtil.isJsonObject(constant)) {
        if (constant.name === null) {
          throw J2JError.elementTypeError(emitter, fieldName, index, constantJson.length, null);
        }
        receiver.push(new JavaEnumConstants(currentIndent, constant.name as string, constant));
      } else {
        throw J2JError.elementTypeError(emitter, fieldName, index, constantJson.length, [null, Object]);
      }
    });
  }
}

export default class JavaEnumConstants extends JavaBaseWithName {
  public readonly arguments: string[] = [];
  public readonly methods: JavaClassMethod[] = [];

  public constructor (currentIndent: number, name: string, json: JsonObject) {
    super(currentIndent, name);
    this.nameWhenAsEmitter = 'EnumConstant';

    if ('arguments' in json) {
      if (JsonUtil.isJsonArray(json.arguments)) {
        json.arguments.forEach((value, index, array) => {
          if (typeof value === 'string') {
            this.arguments.push(value);
          } else {
            QuickConsole.warnElementType(this, 'arguments', index, array.length, String);
          }
        });
      }
    }
    if ('methods' in json) {
      if (JsonUtil.isJsonArray(json.methods)) {
        parseMethods(this, 'methods', this.methods, json.methods, currentIndent + 1);
      } else {
        QuickConsole.warnIgnoreField(this, 'methods', Array);
      }
    }
  }

  public toString () {
    return '' +
      `\n${this.currentIndentString}` +
      this.name +
      (this.arguments.length > 0 ? ` (${this.arguments.join(', ')})` : '') +
      (
        this.methods.length > 0
          ? ` {${this.methods.join('')}\n${this.currentIndentString}}`
          : ''
      );
  }
}

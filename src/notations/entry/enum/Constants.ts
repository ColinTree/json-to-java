import Lodash from 'lodash';
import Notation from '../../../Notation';
import J2JError from '../../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../../utils/json';
import QuickConsole from '../../../utils/QuickConsole';
import JavaMethod from '../../common/Method';

export function parseEnumConstants (emitter: any, fieldName: string,
                                    receiver: JavaEnumConstants[],
                                    constantJson: JsonArray | JsonObject,
                                    currentIndent: number) {
  if (JsonUtil.isJsonObject(constantJson)) {
    Lodash.forOwn(constantJson, (value, name) => {
      if (JsonUtil.isJsonObject(value)) {
        receiver.push(new JavaEnumConstants(Lodash.merge({name}, value), currentIndent));
      } else {
        QuickConsole.warnValueTypeOfKey(emitter, fieldName, name, Object);
      }
    });
  } else {
    constantJson.forEach((constant, index) => {
      if (typeof constant === 'string') {
        receiver.push(new JavaEnumConstants({ name: constant }, currentIndent));
      } else if (JsonUtil.isJsonObject(constant)) {
        if (constant.name === null) {
          throw J2JError.elementTypeError(emitter, fieldName, index, constantJson.length, null);
        }
        receiver.push(new JavaEnumConstants(constant, currentIndent));
      } else {
        throw J2JError.elementTypeError(emitter, fieldName, index, constantJson.length, [String, Object]);
      }
    });
  }
}

export default class JavaEnumConstants extends Notation {
  private name!: string;
  private arguments!: string[];
  private methods!: JavaMethod[];

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'EnumConstant');
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

  protected defineFields () {
    // name
    JavaEnumConstants.HandleMandatoryName(this);

    // arguments
    this.arguments = [];
    this.handleStringArrayField('arguments');

    // methods
    this.methods = [];
    this.handleObjectArrayField('methods', JavaMethod, () => [this.currentIndent + 1]);
  }
}

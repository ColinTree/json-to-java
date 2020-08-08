import Notation from '../../Notation';
import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';

export function parseVariableDefinitions (
  emitter: any, fieldName: string, receiver: JavaVariableDefinition[], argumentJson: JsonArray,
  currentIndent: number) {
  argumentJson.forEach((argument, index) => {
    if (JsonUtil.isJsonObject(argument)) {
      receiver.push(new JavaVariableDefinition(argument, currentIndent));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, length, Object);
    }
  });
}

export default class JavaVariableDefinition extends Notation {
  private name!: string;
  private final!: boolean;
  private type!: string;

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'VariableDefinition');
  }

  public toString () {
    return `${this.final ? 'final ' : ''}${this.type} ${this.name}`;
  }

  protected defineFields () {
    // name
    JavaVariableDefinition.HandleMandatoryName(this);

    // final
    this.final = false;
    this.handleBooleanField('final');

    // type
    this.registerFieldMandatory('type');
    this.handleStringField('type');
  }
}

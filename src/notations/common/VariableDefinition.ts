import Notation from '../../Notation';
import {JsonObject} from '../../utils/json';

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

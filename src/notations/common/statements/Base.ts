import Notation from '../../../Notation';
import {JsonObject} from '../../../utils/json';
import {JavaStatementArray} from '../Statement';

export default abstract class JavaStatementBase extends Notation {
  private type!: string;

  protected constructor (json: JsonObject, currentIndent?: number, nameWhenAsEmitter?: string) {
    super(json, currentIndent, nameWhenAsEmitter);
  }

  public abstract toJavaStatement (): string | JavaStatementArray;

  protected defineFields () {
    // type
    this.type = '';
    this.registerFieldMandatory('type');
    this.handleStringField('type');
  }
}

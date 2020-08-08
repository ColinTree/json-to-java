import Notation from '../Notation';
import {JsonObject} from '../utils/json';
import {JavaAccessModifier} from './common/Modifier';

export default abstract class JavaEntry extends Notation {
  public name!: string;
  public accessModifier!: JavaAccessModifier;

  protected constructor (json: JsonObject, currentIndent?: number, nameWhenAsEmitter?: string) {
    super(json, currentIndent, nameWhenAsEmitter);
  }

  protected defineFields () {
    // name
    JavaEntry.HandleMandatoryName(this);

    // accessModifier
    this.accessModifier = null;
    JavaEntry.HandleAccessModifier(this);
  }
}

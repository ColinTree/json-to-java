import J2JError from '../utils/J2JError';
import {JsonObject} from '../utils/json';
import JavaBaseWithName from './BaseWithName';
import {isJavaAccessModifier, JavaAccessModifier} from './basic/Modifier';

export default abstract class JavaEntry extends JavaBaseWithName {
  public readonly accessModifier: JavaAccessModifier = null;

  public constructor (currentIndent: number, json: JsonObject) {
    super(currentIndent, json.name);

    if ('accessModifier' in json) {
      if (isJavaAccessModifier(json.accessModifier)) {
        this.accessModifier = json.accessModifier as JavaAccessModifier;
      } else {
        throw J2JError.valueNotAccepted(this, 'accessModifier', json.accessModifier);
      }
    }
  }

}

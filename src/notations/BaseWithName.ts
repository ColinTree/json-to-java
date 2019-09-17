import J2JError from '../utils/J2JError';
import JavaBase from './Base';

const JAVA_NAME_VALIDTOR = /^[a-zA-Z_][a-zA-Z0-9_]*$/i;

export function nameValid (name: string) {
  return JAVA_NAME_VALIDTOR.test(name);
}

export default abstract class JavaBaseWithName extends JavaBase {

  public readonly name: string;

  public constructor (currentIndent: number, name: any) {
    super(currentIndent);
    if (typeof name === 'string' && nameValid(name)) {
      this.name = name;
    } else {
      throw new J2JError(this, `invalid name '${name}'`);
    }
  }

}

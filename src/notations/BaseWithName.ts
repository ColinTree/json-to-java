import JavaBase from './Base';
import { ConvertOptions } from './SingleFile';

const JAVA_NAME_VALIDTOR = /^[a-zA-Z_][a-zA-Z0-9_]*$/i;

export function nameValid (name: string) {
  return JAVA_NAME_VALIDTOR.test(name);
}

export default abstract class JavaBaseWithName extends JavaBase {

  private namePrivate: string;

  public get name () {
    return this.namePrivate;
  }

  public constructor (convertOptions: ConvertOptions, currentIndent: number, name: any) {
    super(convertOptions, currentIndent);
    if (typeof name !== 'string' || !nameValid(name)) {
      throw this.err(`invalid name '${name}'`);
    }
    this.namePrivate = name;
  }

  public err (msg: string) {
    return new Error(`[${this.constructor.name}] ${msg}`);
  }

}

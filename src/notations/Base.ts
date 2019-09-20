import { globalConvertOptions } from '../utils/ConvertOptions';

export default abstract class JavaBase {
  public nameWhenAsEmitter: string;

  public readonly currentIndentString: string;
  private readonly currentIndent: number;

  public constructor (currentIndent: number) {
    this.nameWhenAsEmitter = this.constructor.name;
    this.currentIndentString = globalConvertOptions.indent.repeat(currentIndent);
    this.currentIndent = currentIndent;
  }

  public contentIndentString (depth = 1) {
    return globalConvertOptions.indent.repeat(this.currentIndent + depth);
  }

}

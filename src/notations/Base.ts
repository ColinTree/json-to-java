import { ConvertOptions } from './SingleFile';

export default abstract class JavaBase {
  public readonly convertOptions: ConvertOptions;
  public readonly currentIndentString: string;
  private readonly currentIndent: number;

  public constructor (convertOptions: ConvertOptions, currentIndent: number) {
    this.convertOptions = convertOptions;
    this.currentIndentString = this.convertOptions.indent.repeat(currentIndent);
    this.currentIndent = currentIndent;
  }

  public contentIndentString (depth = 1) {
    return this.convertOptions.indent.repeat(this.currentIndent + depth);
  }

}

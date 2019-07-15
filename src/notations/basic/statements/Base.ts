import JavaBase from '../../Base';
import { ConvertOptions } from '../../SingleFile';
import { JavaStatementArray } from '../Statement';

export default abstract class JavaStatementBase extends JavaBase {
  public constructor (convertOptions: ConvertOptions, currentIndent: number) {
    super(convertOptions, currentIndent);
  }
  public abstract toJavaStatement (): string | JavaStatementArray;
}

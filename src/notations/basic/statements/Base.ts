import JavaBase from '../../Base';
import { JavaStatementArray } from '../Statement';

export default abstract class JavaStatementBase extends JavaBase {
  public constructor (currentIndent: number) {
    super(currentIndent);
  }
  public abstract toJavaStatement (): string | JavaStatementArray;
}

import { JsonObject } from '../../utils/json';
import JavaBaseWithName from '../BaseWithName';
import { isJavaAccessModifier, JavaAccessModifier } from '../basic/Modifier';
import JavaStatementArray, { JavaStatementToString } from '../basic/Statement';
import JavaVariableDifinition from '../basic/VariableDifinition';
import { ConvertOptions } from '../SingleFile';

export default class JavaClassConstructor extends JavaBaseWithName {
  public accessModifier: JavaAccessModifier = null;
  public arguments: JavaVariableDifinition[] = [];
  public statements: JavaStatementArray = [];

  public constructor (convertOptions: ConvertOptions, currentIndent: number, className: string, json: JsonObject) {
    super(convertOptions, currentIndent, className);

    if ('accessModifier' in json) {
      if (json.accessModifier !== null && typeof json.accessModifier !== 'string') {
        throw this.err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      if (!isJavaAccessModifier(json.accessModifier)) {
        throw this.err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      this.accessModifier = json.accessModifier as JavaAccessModifier;
    }
    if ('arguments' in json && Array.isArray(json.arguments)) {
      this.arguments.push(...json.arguments.map(argument => {
        if (typeof argument !== 'object' && Array.isArray(argument)) {
          throw this.err('arguments should be a object array');
        }
        try {
          return new JavaVariableDifinition(convertOptions, currentIndent, argument as JsonObject);
        } catch (e) {
          throw this.err((e as Error).message);
        }
      }));
    }
    if ('statements' in json && Array.isArray(json.statements)) {
      // TODO: check statements
      this.statements.push(...json.statements as JavaStatementArray);
    }
  }

  public toString () {
    return '' +
      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      `${this.name} ` +
      `(${this.arguments.join(', ')}) {` +
      JavaStatementToString(this.statements, depth => this.contentIndentString(depth)) +
      `\n${this.currentIndentString}}`;
  }
}

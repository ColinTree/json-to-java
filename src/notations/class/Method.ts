import { JsonObject } from '../../utils/json';
import JavaAnnotation from '../Annotation';
import JavaBaseWithName from '../BaseWithName';
import { isJavaAccessModifier, isJavaNonAccessModifier,
  JavaAccessModifier, JavaNonAccessModifier } from '../basic/Modifier';
import JavaStatementArray, { JavaStatementToString } from '../basic/Statement';
import JavaVariableDifinition from '../basic/VariableDifinition';
import { ConvertOptions } from '../SingleFile';

export default class JavaClassMethod extends JavaBaseWithName {
  public readonly annotations: JavaAnnotation[] = [];
  public readonly accessModifier: JavaAccessModifier = null;
  public readonly nonAccessModifiers: JavaNonAccessModifier[] = [];
  public readonly type: string | 'void' = 'void';
  public readonly arguments: JavaVariableDifinition[] = [];
  public readonly statements: JavaStatementArray = [];

  public constructor (convertOptions: ConvertOptions, currentIndent: number, json: JsonObject) {
    super(convertOptions, currentIndent, json.name);

    if ('annotations' in json && Array.isArray(json.annotations)) {
      this.annotations.push(...json.annotations.map(annotation => {
        if (typeof annotation !== 'object' || Array.isArray(annotation) || annotation === null) {
          throw this.err('Anontation should be a pure object array');
        }
        try {
          return new JavaAnnotation(convertOptions, currentIndent, annotation);
        } catch (e) {
          throw this.err((e as Error).message);
        }
      }));
    }
    if ('accessModifier' in json) {
      if (json.accessModifier !== null && typeof json.accessModifier !== 'string') {
        throw this.err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      if (!isJavaAccessModifier(json.accessModifier)) {
        throw this.err(`accessModifier '${json.accessModifier}' connot be accepted`);
      }
      this.accessModifier = json.accessModifier as JavaAccessModifier;
    }
    if ('nonAccessModifiers' in json && Array.isArray(json.nonAccessModifiers)) {
      this.nonAccessModifiers.push(...json.nonAccessModifiers.map(nonAccessModifier => {
        if (typeof nonAccessModifier !== 'string' || !isJavaNonAccessModifier(nonAccessModifier)) {
          throw this.err(`nonAccessModifier '${nonAccessModifier}' cannot be accepted`);
        }
        return nonAccessModifier as JavaNonAccessModifier;
      }));
    }
    if ('type' in json && typeof json.type === 'string') {
      this.type = json.type;
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
      // TODO: check this
      this.statements.push(...json.statements as JavaStatementArray);
    }
  }

  public toString () {
    return '' +
      this.annotations.join('') +
      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      this.nonAccessModifiers.join(' ') + (this.nonAccessModifiers.length > 0 ? ' ' : '') +
      `${this.type} ` +
      `${this.name} ` +
      `(${this.arguments.join(', ')}) {` +
      JavaStatementToString(this.statements, depth => this.contentIndentString(depth)) +
      `\n${this.currentIndentString}}`;
  }
}

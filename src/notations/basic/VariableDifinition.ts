import { JsonObject } from '../../utils/json';
import JavaBaseWithName from '../BaseWithName';
import { ConvertOptions } from '../SingleFile';

export default class JavaVariableDifinition extends JavaBaseWithName {
  public readonly final: boolean = false;
  public readonly type: string = '';

  public constructor (convertOptions: ConvertOptions, currentIndent: number, json: JsonObject) {
    super(convertOptions, currentIndent, json.name);

    if ('final' in json && typeof json.final === 'boolean') {
      this.final = json.final;
    }
    if (!('type' in json) || typeof json.type !== 'string') {
      throw this.err('VariableDifinition requires a type');
    }
    this.type = json.type;
  }

  public toString () {
    return `${this.final ? 'final ' : ''}${this.type} ${this.name}`;
  }
}

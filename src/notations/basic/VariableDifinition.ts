import { JAVA_NAME_VALIDTOR } from '../../utils/consts';
import { JsonObject } from '../../utils/json';
import JavaConvertable from './JavaConvertable';

export default class JavaVariableDifinition implements JavaConvertable {
  public final: boolean = false;
  public type: string = '';
  public name: string = '';
  public value: string | null = null;

  public constructor (json: JsonObject) {
    if (!('name' in json) || typeof json.name !== 'string') {
      throw new Error('VariableDifinition should have a name');
    }
    this.name = json.name;
    if (!JAVA_NAME_VALIDTOR.test(this.name)) {
      throw new Error(`VariableDifinition name invalid: ${this.name}`);
    }

    const err = (message: string) => new Error(`[VariableDifinition ${this.name}] ${message}`);
    if ('final' in json && typeof json.final === 'boolean') {
      this.final = json.final;
    }
    if (!('type' in json) || typeof json.type !== 'string') {
      throw err('VariableDifinition requires a type');
    }
    this.type = json.type;
    if ('value' in json && (json.value === null || typeof json.value === 'string')) {
      this.value = json.value;
    }
  }

  public toJava () {
    let result = '';
    if (this.final) {
      result += 'final ';
    }
    result += `${this.type} ${this.name}`;
    if (this.value !== null) {
      result += ` = ${this.value}`;
    }
    return result;
  }
}

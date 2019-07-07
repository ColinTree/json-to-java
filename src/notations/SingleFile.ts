import { JsonObject, JsonUtil } from '../utils/json';
import JavaClass from './Class';

export interface ConvertOptions {
  indent: string;
}
function defaultConvertOptions (): ConvertOptions {
  return { indent: '    ' };
}

export default class JavaSingleFile {

  public readonly convertOptions: ConvertOptions = defaultConvertOptions();

  public readonly package: string = '';
  public readonly imports: string[] = [];
  public readonly mainClass: JavaClass;
  public readonly otherClasses: JavaClass[] = [];

  public constructor (json: JsonObject) {
    if (true) {
      // TODO: remove this in the future, this is kept as backward compatible
      if (typeof json.indentationSize !== 'number' && json.indentationSize !== 'tab') {
        json.indentationSize = 4;
      }
      this.convertOptions.indent = json.indentationSize === 'tab' ? '\t' : ' '.repeat(json.indentationSize);
    }
    if ('convertOptions' in json &&
        (typeof json.convertOptions !== 'object' ||
          Array.isArray(json.convertOptions) ||
          json.convertOptions === null
        )) {
      throw new Error('convertOptions should be a JsonObject');
    }
    if ('convertOptions' in json) {
      const convertOptions = json.convertOptions as JsonObject;
      if ('indent' in convertOptions) {
        if (typeof convertOptions.indent === 'number') {
          this.convertOptions.indent = ' '.repeat(convertOptions.indent);
        } else if (convertOptions.indent === 'tab') {
          this.convertOptions.indent = '\t';
        } else {
          throw new Error('convertOptions.indent should be a number or string "tab"');
        }
      }
    }
    if ('package' in json && typeof json.package === 'string') {
      this.package = json.package;
    }
    if ('imports' in json && Array.isArray(json.imports)) {
      this.imports.push(...json.imports.map(importElement => {
        if (typeof importElement !== 'string') {
          throw new Error('imports should be a string array');
        }
        return importElement;
      }));
    }
    if (!('mainClass' in json) ||
        typeof json.mainClass !== 'object' ||
        Array.isArray(json.mainClass) ||
        json.mainClass === null) {
      throw new Error('There must be a mainClass defined in a java file');
    }
    this.mainClass = new JavaClass(this.convertOptions, 0, json.mainClass);
    if (![ 'public', null ].includes(this.mainClass.accessModifier)) {
      throw new Error('MainClass of a java file should have "public" or null for its accessModifier');
    }
    if ('otherClasses' in json && Array.isArray(json.otherClasses)) {
      this.otherClasses.push(...json.otherClasses.map(claz => {
        if (typeof claz !== 'object' && Array.isArray(claz)) {
          throw new Error('otherClasses should be a object array');
        }
        // TODO: limit modifiers, e.g. private
        return new JavaClass(this.convertOptions, 0, claz as JsonObject);
      }));
    }
  }

  public toString () {
    return '' +
      (this.package.length > 0 ? `package ${this.package};\n` : '') +

      (this.imports.length > 0
        ? `\n${this.imports.map(importElement => `import ${importElement};`).join('\n')}\n`
        : '') +

      `${this.mainClass}\n` +

      this.otherClasses.join('\n') + (this.otherClasses.length > 0 ? '\n' : '');
  }
}

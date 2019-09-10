import { JsonObject, JsonUtil } from '../utils/json';
import JavaClass from './Class';
import Console from '../utils/Console';

export interface ConvertOptions {
  indent: string;
}
function defaultConvertOptions (): ConvertOptions {
  return { indent: '    ' };
}

export default class JavaSingleFile {

  public readonly ACCEPTED_ENTRY_TYPES = [ 'class' ];

  public readonly convertOptions: ConvertOptions = defaultConvertOptions();

  public readonly package: string = '';
  public readonly imports: string[] = [];
  public readonly entryType: 'class' = 'class';
  public readonly entry: JavaClass;

  public constructor (json: JsonObject) {
    if (true) {
      // TODO: remove this in the future, this is kept as backward compatible
      if (typeof json.indentationSize !== 'number' && json.indentationSize !== 'tab') {
        json.indentationSize = 4;
      }
      this.convertOptions.indent = json.indentationSize === 'tab' ? '\t' : ' '.repeat(json.indentationSize);
    }
    if ('convertOptions' in json && !JsonUtil.isJsonObject(json.convertOptions)) {
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
    // adapt older version which use mainClass as entry
    if ('mainClass' in json && JsonUtil.isJsonObject(json.mainClass)) {
      Console.log('Converted legacy scheme field \'mainClass\' into \'entry\'');
      json.entryType = 'class';
      json.entry = json.mainClass;
      delete json.mainClass;
    }
    // deprecate field otherClasses
    if ('otherClasses' in json) {
      throw new Error('OtherClass is no more accepted in json-to-java scheme');
    }
    if ('entryType' in json && typeof json.entryType === 'string' && json.entryType in this.ACCEPTED_ENTRY_TYPES) {
      // since it had been checked above
      this.entryType = json.entryType as any;
    }
    if (!('entry' in json) || !JsonUtil.isJsonObject(json.entry)) {
      throw new Error('There must be an entry in a java file!');
    }
    switch (this.entryType) {
      case 'class':
        this.entry = new JavaClass(this.convertOptions, 0, json.entry as JsonObject);
        break;
      default:
        throw new Error(`Unrecognized entryType '${this.entryType}'`);
    }
    // if (![ 'public', null ].includes(this.entry.accessModifier)) {
    //   throw new Error('Entry of a java file should have "public" or null for its accessModifier');
    // }
  }

  public toString () {
    return '' +
      (this.package.length > 0 ? `package ${this.package};\n` : '') +

      (this.imports.length > 0
        ? `\n${this.imports.map(importElement => `import ${importElement};`).join('\n')}\n`
        : '') +

      `${this.entry}\n`;
  }
}

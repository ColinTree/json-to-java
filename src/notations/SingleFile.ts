import J2JError from '../utils/J2JError';
import { JsonArray, JsonObject, JsonUtil } from '../utils/json';
import QuickConsole from '../utils/QuickConsole';
import { StringKeyValuePair } from '../utils/StringKeyValuePair';
import JavaClass from './Class';

interface ConvertOptions {
  indent: string;
}
function defaultConvertOptions (): ConvertOptions {
  return { indent: '    ' };
}
export const globalConvertOptions: ConvertOptions = defaultConvertOptions();

export default class JavaSingleFile {

  public readonly ACCEPTED_ENTRY_TYPES = [ 'class' ];

  public readonly nameWhenAsEmitter: string;

  public readonly fileDescription: null | string | string[] | StringKeyValuePair = null ;
  public readonly package: string = '';
  public readonly imports: string[] = [];
  public readonly entryType: 'class' = 'class';
  public readonly entry: JavaClass;

  public constructor (json: JsonObject) {
    this.nameWhenAsEmitter = 'file root';

    // convert legacy field indentationSize into field convertOptions.indent
    if ('indentationSize' in json) {
      QuickConsole.warnDeprecated(this, 'indentationSize', 'convertOptions.indent');
      if (typeof json.indentationSize !== 'number' && json.indentationSize !== 'tab') {
        QuickConsole.warnTypeWithReplacement(this, 'indentationSize', [ Number, 'string "tab"' ], '4');
        json.indentationSize = 4;
      }
      json.convertOptions = (json.convertOptions || {}) as JsonObject;
      json.convertOptions.indent = json.indentationSize === 'tab' ? 'tab' : json.indentationSize;
    }
    if ('convertOptions' in json) {
      if (JsonUtil.isJsonObject(json.convertOptions)) {
        const convertOptions = json.convertOptions as JsonObject;
        if ('indent' in convertOptions) {
          if (typeof convertOptions.indent === 'number') {
            globalConvertOptions.indent = ' '.repeat(convertOptions.indent);
          } else if (convertOptions.indent === 'tab') {
            globalConvertOptions.indent = '\t';
          } else {
            QuickConsole.warnIgnoreField(this, 'convertOptions.indent', [ Number, 'string "tab"' ]);
          }
        }
      } else {
        QuickConsole.warnIgnoreField(this, 'convertOptions', Object);
      }
    }
    if ('fileDescription' in json) {
      if (json.fileDescription === null) {
        this.fileDescription = null;
      } else if (typeof json.fileDescription === 'string') {
        this.fileDescription = json.fileDescription;
      } else if (JsonUtil.isJsonObject(json.fileDescription)) {
        const values = json.fileDescription as JsonObject;
        const newValues = {} as StringKeyValuePair;
        Object.keys(values).forEach(key => {
          let value = values[key];
          if (typeof value !== 'string') {
            QuickConsole.warnValueTypeOfKey(this, 'fileDescription', key, String);
            value = String(value);
          }
          newValues[key] = value;
        });
        this.fileDescription = newValues;
      } else if (JsonUtil.isJsonArray(json.fileDescription)) {
        json. fileDescription = json.fileDescription as JsonArray;
        this.fileDescription = [];
        json.fileDescription.forEach((description, index) => {
          if (typeof description !== 'string') {
            QuickConsole.warnElementType(this, 'fileDescription', index, length, String);
          }
          (this.fileDescription as string[]).push(String(description));
        });
      } else {
        QuickConsole.warnIgnoreField(this, 'fileDescription', [ null, String, Object, Array ]);
      }
    }
    if ('package' in json) {
      if (typeof json.package === 'string') {
        this.package = json.package;
      } else {
        QuickConsole.warnIgnoreField(this, 'package', String);
      }
    }
    if ('imports' in json) {
      if (JsonUtil.isJsonArray(json.imports)) {
        json.imports = json.imports as JsonArray;
        const length = json.imports.length;
        json.imports.forEach((importElement, index) => {
          if (typeof importElement !== 'string') {
            QuickConsole.warnElementType(this, 'imports', index, length, String);
          }
          this.imports.push(String(importElement));
        });
      } else {
        QuickConsole.warnIgnoreField(this, 'imports', Array);
      }
    }
    // convert legacy field mainClass into field entry
    if ('mainClass' in json) {
      QuickConsole.warnDeprecated(this, 'mainClass', 'entry');
      if (JsonUtil.isJsonObject(json.mainClass)) {
        json.entryType = 'class';
        json.entry = json.mainClass;
        delete json.mainClass;
      } else {
        QuickConsole.warnIgnoreField(this, 'mainClass', Object);
      }
    }
    // deprecated field otherClasses
    if ('otherClasses' in json) {
      QuickConsole.warnRemoved(this, 'otherClasses');
    }
    if ('entryType' in json) {
      if (this.ACCEPTED_ENTRY_TYPES.includes(json.entryType as any)) {
        this.entryType = json.entryType as any;
      } else {
        QuickConsole.warnIgnoreField(this, 'entryType', this.ACCEPTED_ENTRY_TYPES.map(type => `"${type}"`));
      }
    }
    if ('entry' in json) {
      if (JsonUtil.isJsonObject(json.entry)) {
        switch (this.entryType) {
          case 'class':
            this.entry = new JavaClass(0, json.entry as JsonObject);
            break;
          default:
            // impossible since type is checked above as field
            throw J2JError.valueNotAccepted(this, 'entryType',  this.entryType);
        }
        const acceptedAccessModifier = [ 'public', null ];
        if (!acceptedAccessModifier.includes(this.entry.accessModifier)) {
          throw J2JError.typeError(this, 'entry.accessModifier', acceptedAccessModifier);
        }
      } else {
        throw J2JError.typeError(this, 'entry', Object);
      }
    } else {
      throw J2JError.fieldNotDefined(this, 'entry');
    }
  }

  public toString () {
    return this.formatFileDescription() +
      (this.package.length > 0 ? `package ${this.package};\n` : '') +

      (this.imports.length > 0
        ? `\n${this.imports.map(importElement => `import ${importElement};`).join('\n')}\n`
        : '') +

      `${this.entry}\n`;
  }

  private formatFileDescription () {
    let fileDescription = this.fileDescription;
    if (fileDescription === null) {
      return '';
    }
    if (typeof fileDescription === 'string') {
      fileDescription = [ fileDescription ];
    }
    let rtn = '/**\n';
    if (Array.isArray(fileDescription)) {
      fileDescription.forEach(description => {
        rtn += ` * ${description}\n`;
      });
    } else {
      Object.keys(fileDescription).forEach(key => {
        rtn += ` * ${key}: ${(fileDescription as StringKeyValuePair)[key]}\n`;
      });
    }
    rtn += ' */\n';
    return rtn;
  }
}

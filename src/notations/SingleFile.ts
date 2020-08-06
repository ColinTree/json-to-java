import Lodash, {Dictionary} from 'lodash';
import {globalConvertOptions} from '../utils/ConvertOptions';
import J2JError from '../utils/J2JError';
import {JsonObject, JsonUtil} from '../utils/json';
import QuickConsole from '../utils/QuickConsole';
import JavaClass from './Class';
import JavaEnum from './Enum';

type EntryTypeString = 'class' | 'enum';
type EntryType = JavaClass | JavaEnum;

export default class JavaSingleFile {

  public readonly ACCEPTED_ENTRY_TYPES = [ 'class', 'enum' ];
  public readonly DEFAULT_DESCRIPTION_MSG = 'This java file is generated by json-to-java by ColinTree!';

  public readonly nameWhenAsEmitter: string;

  public readonly fileDescription: string[] | Dictionary<string> = [ this.DEFAULT_DESCRIPTION_MSG ];
  public readonly package: string = '';
  public readonly imports: string[] = [];
  public readonly entryType: EntryTypeString = 'class';
  public readonly entry: EntryType;

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
        if ('indent' in json.convertOptions) {
          if (typeof json.convertOptions.indent === 'number') {
            globalConvertOptions.indent = ' '.repeat(json.convertOptions.indent);
          } else if (json.convertOptions.indent === 'tab') {
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
      if (typeof json.fileDescription === 'string') {
        this.fileDescription = [ this.DEFAULT_DESCRIPTION_MSG, json.fileDescription ];
      } else if (JsonUtil.isJsonObject(json.fileDescription)) {
        this.fileDescription = Lodash.merge(
          { '~INFO~': this.DEFAULT_DESCRIPTION_MSG },
          Lodash.mapValues(json.fileDescription, (value, key) => {
            if (typeof value !== 'string') {
              QuickConsole.warnValueTypeOfKey(this, 'fileDescription', key, String);
            }
            return String(value);
          }));
      } else if (JsonUtil.isJsonArray(json.fileDescription)) {
        this.fileDescription = Lodash.concat(
          [ this.DEFAULT_DESCRIPTION_MSG ],
          json.fileDescription.map((description, index) => {
            if (typeof description !== 'string') {
              QuickConsole.warnElementType(this, 'fileDescription', index, length, String);
            }
            return String(description);
          }));
      } else {
        QuickConsole.warnIgnoreField(this, 'fileDescription', [ String, Object, Array ]);
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
        this.imports = json.imports.map((importElement, index, imports) => {
          if (typeof importElement !== 'string') {
            QuickConsole.warnElementType(this, 'imports', index, imports.length, String);
          }
          return String(importElement);
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
            this.entry = new JavaClass(0, json.entry);
            break;
          case 'enum':
            this.entry = new JavaEnum(0, json.entry);
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
    const fileDescription = this.fileDescription;
    if (fileDescription === null) {
      return '';
    }
    let rtn = '/**\n';
    if (Array.isArray(fileDescription)) {
      fileDescription.forEach(description => {
        rtn += ` * ${description}\n`;
      });
    } else {
      Lodash.forOwn(fileDescription, (value, key) => {
        rtn += ` * ${key}: ${value}\n`;
      });
    }
    rtn += ' */\n';
    return rtn;
  }
}

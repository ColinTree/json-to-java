import { JsonObject } from '../utils/json';
import JavaConvertable from './basic/JavaConvertable';
import JavaClass from './Class';

export default class JavaSingleFile implements JavaConvertable {

  public indentationSize: number = 4;
  public package: string = '';
  public imports: string[] = [];
  public mainClass: JavaClass = {} as JavaClass;
  public otherClasses: JavaClass[] = [];

  public constructor (json: JsonObject) {
    if ('indentationSize' in json && typeof json.indentationSize === 'number') {
      this.indentationSize = json.indentationSize;
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
    if ('mainClass' in json && typeof json.mainClass === 'object' && !Array.isArray(json.mainClass)) {
      this.mainClass = new JavaClass(json.mainClass);
    }
    if ('otherClasses' in json && Array.isArray(json.otherClasses)) {
      this.otherClasses.push(...json.otherClasses.map(claz => {
        if (typeof claz !== 'object' && Array.isArray(claz)) {
          throw new Error('otherClasses should be a object array');
        }
        // TODO: limit modifiers, e.g. private
        return new JavaClass(claz as JsonObject);
      }));
    }
  }

  public toJava () {
    let result = '';
    if (this.package.length > 0) {
      result += `package ${this.package};\n`;
    }
    this.imports.forEach(importElement => {
      result += `\nimport ${importElement};`;
    });
    if (this.imports.length > 0) {
      result += '\n';
    }
    if (this.mainClass.accessModifier !== 'public' && this.mainClass.accessModifier !== null) {
      throw new Error('MainClass of a java file should have "public" or null for `accessModifier`');
    }
    result += this.mainClass.toJava(this.indentationSize, 0);
    result += '\n';
    this.otherClasses.forEach(claz => {
      result += claz.toJava(this.indentationSize, 0);
      result += '\n';
    });
    return result;
  }
}

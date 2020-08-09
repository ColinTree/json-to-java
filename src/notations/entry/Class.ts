import {JsonObject, JsonUtil} from '../../utils/json';
import JavaAnnotation from '../common/Annotation';
import JavaAttribute from '../common/Attribute';
import JavaConstructor from '../common/Constructor';
import JavaMethod from '../common/Method';
import {JavaNonAccessModifier, JavaNonAccessModifiers} from '../common/Modifier';
import JavaEntry from '../Entry';
import JavaEnum from './Enum';

export default class JavaClass extends JavaEntry {
  private annotations!: JavaAnnotation[];
  private nonAccessModifiers!: JavaNonAccessModifier[];
  private extends!: string | null;
  private implements!: string[];
  private attributes!: JavaAttribute[];
  private constructors!: JavaConstructor[];
  private methods!: JavaMethod[];
  private innerClasses!: JavaClass[];
  private innerEnums!: JavaEnum[];

  public constructor (json: JsonObject, currentIndent: number) {
    super(json, currentIndent, 'Class');
  }

  public toString () {
    return '' +
      this.annotations.join('') +

      `\n${this.currentIndentString}` +
      (this.accessModifier ? `${this.accessModifier} ` : '') +
      this.nonAccessModifiers.join(' ') + (this.nonAccessModifiers.length > 0 ? ' ' : '') +
      `class ${this.name} ` +
      (this.extends ? `extends ${this.extends} ` : '') +
      (this.implements.length > 0 ? `implements ${this.implements.join(', ')} ` : '') +
      '{' +

      this.attributes.join('') + (this.attributes.length > 0 ? '\n' : '') +
      this.constructors.join('') + (this.constructors.length > 0 ? '\n' : '') +
      this.methods.join('') + (this.methods.length > 0 ? '\n' : '') +
      this.innerClasses.join('') + (this.innerClasses.length > 0 ? '\n' : '') +
      this.innerEnums.join('') + (this.innerEnums.length > 0 ? '\n' : '') +

      `\n${this.currentIndentString}}`;
  }

  protected defineFields () {
    super.defineFields();

    // annotations
    this.annotations = [];
    this.handleObjectArrayField('annotations', JavaAnnotation);

    // nonAccessModifiers
    this.nonAccessModifiers = [];
    this.handleEnumArrayField('nonAccessModifiers', JavaNonAccessModifiers);

    // extends
    this.extends = null;
    this.handleStringField('extends');

    // implements
    this.implements = [];
    this.registerFieldPreprocessor('implements', value => {
      return JsonUtil.isJsonArray(value) ? value : [ String(value) ];
    });
    this.handleStringArrayField('implements');

    // attributes
    this.attributes = [];
    this.handleObjectArrayField('attributes', JavaAttribute, () => [this.currentIndent + 1]);

    // constructors
    this.constructors = [];
    this.handleObjectArrayField('constructors', JavaConstructor, () => [this.currentIndent + 1, this.name]);

    // methods
    this.methods = [];
    this.handleObjectArrayField('methods', JavaMethod, () => [this.currentIndent + 1]);

    // classes
    this.registerFieldDeprecated('classes', 'innerClasses');

    // innerClasses
    this.innerClasses = [];
    this.handleObjectArrayField('innerClasses', JavaClass, () => [this.currentIndent + 1]);

    // innerEnums
    this.innerEnums = [];
    this.handleObjectArrayField('innerEnums', JavaEnum, () => [this.currentIndent + 1]);
  }
}

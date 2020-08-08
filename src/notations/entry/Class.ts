import J2JError from '../../utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from '../../utils/json';
import JavaAnnotation, {parseAnnotations} from '../common/Annotation';
import JavaAttribute, {parseAttributes} from '../common/Attribute';
import JavaConstructor, {parseConstructors} from '../common/Constructor';
import JavaMethod, {parseMethods} from '../common/Method';
import {JavaNonAccessModifier, parseNonAccessModifiers} from '../common/Modifier';
import JavaEntry from '../Entry';
import JavaEnum, {parseEnums} from './Enum';

export function parseClasses (
    emitter: any, fieldName: string, receiver: JavaClass[], classJson: JsonArray, currentIndent: number) {
  classJson.forEach((clazz, index) => {
    if (JsonUtil.isJsonObject(clazz)) {
      receiver.push(new JavaClass(clazz, currentIndent));
    } else {
      throw J2JError.elementTypeError(emitter, fieldName, index, classJson.length, Object);
    }
  });
}

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
    this.registerArrayField('annotations', value =>
      parseAnnotations(this, 'annotations', this.annotations, value, this.currentIndent));

    // nonAccessModifiers
    this.nonAccessModifiers = [];
    this.registerArrayField('nonAccessModifiers', value =>
      parseNonAccessModifiers(this, 'nonAccessModifiers', this.nonAccessModifiers, value));

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
    this.registerArrayField('attributes', value =>
      parseAttributes(this, 'attributes', this.attributes, value, this.currentIndent + 1));

    // constructors
    this.constructors = [];
    this.registerArrayField('constructors', value =>
      parseConstructors(this, 'constructors', this.name, this.constructors, value, this.currentIndent + 1));

    // methods
    this.methods = [];
    this.registerArrayField('methods', value =>
      parseMethods(this, 'methods', this.methods, value, this.currentIndent + 1));

    // classes
    this.registerFieldDeprecated('classes', 'innerClasses');

    // innerClasses
    this.innerClasses = [];
    this.registerArrayField('innerClasses', value =>
      parseClasses(this, 'innerClasses', this.innerClasses, value, this.currentIndent + 1));

    // innerEnums
    this.innerEnums = [];
    this.registerArrayField('innerEnums', value =>
      parseEnums(this, 'innerEnums', this.innerEnums, value, this.currentIndent + 1));
  }
}

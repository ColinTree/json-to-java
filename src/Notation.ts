import Lodash from 'lodash';
import {globalConvertOptions} from './utils/ConvertOptions';
import DefaultMap from './utils/DefaultMap';
import J2JError from './utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from './utils/json';
import QuickConsole, {Expectation, Expectations} from './utils/QuickConsole';

type FieldValidator<T> = (value: any) => boolean;
type FieldHandler<T> = (value: T, json: JsonObject) => void;
type FieldPreprocessor = (value: any) => any;
type FieldAfterChecker = () => void;

export interface FieldRegistration {
  type: Expectations;
  validator: FieldValidator<any>;
  handler: FieldHandler<any>;
  expectations?: Expectations;
}

class FieldInfo {
  public mandatory = false;
  public deprecated?: string | null;
  public preprocessor?: FieldPreprocessor;
  public afterChecker?: FieldAfterChecker;
  public registrations: FieldRegistration[] = [];
}

const JAVA_NAME_VALIDATOR = /^[a-zA-Z_][a-zA-Z0-9_]*$/i;

// tslint:disable-next-line:max-classes-per-file
export default abstract class Notation {

  // Handle some specified fields
  public static HandleMandatoryName (receiver: Notation) {
    receiver.registerFieldMandatory('name');
    receiver.registerFieldPreprocessor('name', value => {
      if (!JAVA_NAME_VALIDATOR.test(value)) {
        throw new J2JError(receiver, `invalid name '${value}'`);
      }
      return value;
    });
    receiver.handleStringField('name');
  }

  public readonly nameWhenAsEmitter: string;
  public readonly currentIndent: number;
  public readonly currentIndentString: string;

  private readonly fields: DefaultMap<string, FieldInfo>;

  protected constructor (json: JsonObject, currentIndent?: number, nameWhenAsEmitter?: string) {
    this.nameWhenAsEmitter = nameWhenAsEmitter === undefined ? this.constructor.name : nameWhenAsEmitter;
    this.currentIndent = currentIndent === undefined ? 0 : currentIndent;
    this.currentIndentString = globalConvertOptions.indent.repeat(this.currentIndent);

    this.fields = new DefaultMap<string, FieldInfo>(FieldInfo);

    this.defineFields();
    this.loadJson(json);
  }

  public contentIndentString (depth = 1) {
    return globalConvertOptions.indent.repeat(this.currentIndent + depth);
  }

  protected abstract defineFields (): void;

  // ---------------------------
  //  field property registrars
  // ---------------------------

  protected registerFieldDeprecated (name: string, replacement?: string) {
    this.fields.get(name).deprecated = replacement === undefined ? null : replacement;
  }
  protected registerFieldMandatory (name: string) {
    this.fields.get(name).mandatory = true;
  }
  protected registerFieldPreprocessor (name: string, preprocessor: FieldPreprocessor) {
    this.fields.get(name).preprocessor = preprocessor;
  }
  protected registerFieldAfterCheck (name: string, checker: FieldAfterChecker) {
    this.fields.get(name).afterChecker = checker;
  }

  // ---------------------------------
  //  field value handlers registrars
  // ---------------------------------

  protected registerField (name: string, type: Expectations, validator: FieldValidator<any>,
                           handler: FieldHandler<any>, expectations?: Expectations) {
    this.fields.get(name).registrations.push({ type, validator, handler, expectations });
  }
  protected registerBooleanField (name: string, handler: (value: boolean, json: JsonObject) => void) {
    this.registerField(name, Boolean, v => typeof v === 'boolean', handler);
  }
  protected registerNumberField (name: string, handler: (value: number, json: JsonObject) => void) {
    this.registerField(name, Number, v => typeof v === 'number', handler);
  }
  protected registerStringField (name: string, handler: (value: string, json: JsonObject) => void) {
    this.registerField(name, String, v => typeof v === 'string', handler);
  }
  protected registerArrayField (name: string, handler: (value: JsonArray, json: JsonObject) => void) {
    this.registerField(name, Array, JsonUtil.isJsonArray, handler);
  }
  protected registerObjectField (name: string, handler: (value: JsonObject, json: JsonObject) => void) {
    this.registerField(name, Object, JsonUtil.isJsonObject, handler);
  }
  protected registerEnumField (name: string, acceptedValues: Expectation[], handler: FieldHandler<any>) {
    this.registerField(name, acceptedValues, v => acceptedValues.includes(v), handler);
  }

  // -------------------------
  //  handlers of basic types
  // -------------------------

  protected handleBooleanField (fieldName: string) {
    this.registerBooleanField(fieldName, value => ((this as any)[fieldName] = value));
  }
  protected handleNumberField (fieldName: string) {
    this.registerNumberField(fieldName, value => ((this as any)[fieldName] = value));
  }
  protected handleStringField (fieldName: string) {
    this.registerStringField(fieldName, value => ((this as any)[fieldName] = value));
  }
  protected handleEnumField (fieldName: string, acceptedValues: Expectation[]) {
    this.registerEnumField(fieldName, acceptedValues, value => ((this as any)[fieldName] = value));
  }
  /**
   * handle a field that input is a JsonArray of strings
   * @param fieldName
   * @param acceptAnyway non-string values will be ignored if this is false
   * @protected
   */
  protected handleStringArrayField (fieldName: string, acceptAnyway = true) {
    this.registerArrayField(fieldName, theArray => {
      if (!JsonUtil.isJsonArray((this as any)[fieldName])) {
        (this as any)[fieldName] = [];
      }
      theArray.forEach((value, index) => {
        if (typeof value !== 'string') {
          QuickConsole.warnElementType(this, fieldName, index, theArray.length, String);
        }
        if (acceptAnyway || typeof value === 'string') {
          (this as any)[fieldName].push(String(value));
        }
      });
    });
  }
  /**
   * handle a field that input is a JsonArray of accepted values
   * @param fieldName
   * @param acceptedValues
   * @protected
   * @throws J2JError when any of array value is not accepted
   */
  protected handleEnumArrayField (fieldName: string, acceptedValues: any[]) {
    this.registerArrayField(fieldName, theArray => {
      if (!JsonUtil.isJsonArray((this as any)[fieldName])) {
        (this as any)[fieldName] = [];
      }
      theArray.forEach(value => {
        if (!acceptedValues.includes(value)) {
          throw J2JError.valueNotAccepted(this, fieldName, value);
        }
        (this as any)[fieldName].push(value);
      });
    });
  }
  /**
   * handle a field that input is a JsonArray of objects
   *   (use provided constructor to create new field instance)
   * @param fieldName
   * @param constructor
   * @param parameterProvider
   * @protected
   */
  // TODO: really use any for type of constructor?
  protected handleObjectArrayField (
    fieldName: string,
    constructor: any,
    parameterProvider: (value: JsonObject) => any[] = () => [ this.currentIndent ],
  ) {
    this.registerArrayField(fieldName, theArray => {
      theArray.forEach((data, index) => {
        if (!JsonUtil.isJsonArray((this as any)[fieldName])) {
          (this as any)[fieldName] = [];
        }
        if (JsonUtil.isJsonObject(data)) {
          (this as any)[fieldName].push(new constructor(data, ...parameterProvider(data)));
        } else {
          throw J2JError.elementTypeError(this, fieldName, index, theArray.length, Object);
        }
      });
    });
  }
  /**
   * handle a field that input is a JsonObject of string-string pairs
   * @param fieldName
   * @param acceptAnyway non-string values will be ignored if this is false
   * @protected
   */
  protected handleStringObjectField (fieldName: string, acceptAnyway = true) {
    this.registerObjectField(fieldName, theObject => {
      if (!JsonUtil.isJsonObject((this as any)[fieldName])) {
        (this as any)[fieldName] = {};
      }
      Lodash.mapValues(theObject, (value, key) => {
        if (typeof value !== 'string') {
          QuickConsole.warnValueTypeOfKey(this, fieldName, key, String);
        }
        if (acceptAnyway || typeof value === 'string') {
          (this as any)[fieldName][key] = String(value);
        }
      });
    });
  }

  /**
   * json loader (using handlers registered)
   */
  private loadJson (json: JsonObject) {
    this.fields.forEach((fieldInfo, name) => {
      // if such field exists in json
      if (!(name in json)) {
        if (fieldInfo.mandatory) {
          throw J2JError.fieldNotDefined(this, name);
        }
        return;
      }
      // check if deprecated/removed
      if (fieldInfo.deprecated !== undefined) {
        const replacement = fieldInfo.deprecated;
        if (replacement === null) {
          QuickConsole.warnRemoved(this, name);
        } else {
          QuickConsole.warnDeprecated(this, name, replacement);
        }
      }
      let handled = false;
      let value = json[name];
      // preprocess
      if (fieldInfo.preprocessor !== undefined) {
        value = fieldInfo.preprocessor(value);
      }
      // go through all registrations
      const expectations = new Set<Expectation>();
      fieldInfo.registrations.forEach(reg => {
        if (reg.validator(value)) {
          reg.handler(value, json);
          handled = true;
        } else {
          const regExpectations = reg.expectations !== undefined ? reg.expectations : reg.type;
          if (Array.isArray(regExpectations)) {
            regExpectations.forEach(val => expectations.add(val));
          } else {
            expectations.add(regExpectations);
          }
        }
      });
      // not handled by any handler yet
      if (!handled) {
        if (fieldInfo.mandatory) {
          throw J2JError.typeError(this, name, Array.from(expectations));
        } else {
          QuickConsole.warnIgnoreField(this, name, Array.from(expectations));
        }
      }
      if (handled && fieldInfo.afterChecker !== undefined) {
        fieldInfo.afterChecker();
      }
    });
    // fields that have no registration
    Lodash.filter(Lodash.keys(json), key => !this.fields.has(key))
      .forEach(key => QuickConsole.warnUnrecognizable(this, key));
  }
}

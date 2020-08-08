import Lodash from 'lodash';
import {isJavaAccessModifier} from './notations/common/Modifier';
import {globalConvertOptions} from './utils/ConvertOptions';
import J2JError from './utils/J2JError';
import {JsonArray, JsonObject, JsonUtil} from './utils/json';
import QuickConsole, {Expectation, Expectations} from './utils/QuickConsole';

type FieldValidator<T> = (value: any) => boolean;
type FieldHandler<T> = (value: T, json: JsonObject) => void;
type FieldPreprocessor = (value: any) => any;

export interface FieldRegistration {
  type: Expectations;
  validator: FieldValidator<any>;
  handler: FieldHandler<any>;
  expectations?: Expectations;
}

const JAVA_NAME_VALIDATOR = /^[a-zA-Z_][a-zA-Z0-9_]*$/i;

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
  public static HandleAccessModifier (receiver: Notation) {
    receiver.registerField('accessModifier', String, isJavaAccessModifier,
      value => ((receiver as any).accessModifier = value));
    receiver.registerOnFieldUnhandled('accessModifier', value => {
      throw J2JError.valueNotAccepted(receiver, 'accessModifier', value);
    });
  }

  public readonly nameWhenAsEmitter: string;
  public readonly currentIndent: number;
  public readonly currentIndentString: string;

  private readonly deprecatedFields: Map<string, string | undefined>;
  private readonly mandatoryFields: Set<string>;
  private readonly fieldUnhandledHandlers: Map<string, FieldHandler<any>>;
  private readonly fieldPreprocessors: Map<string, FieldPreprocessor>;
  private readonly fields: Map<string, FieldRegistration[]>;

  protected constructor (json: JsonObject, currentIndent?: number, nameWhenAsEmitter?: string) {
    this.nameWhenAsEmitter = nameWhenAsEmitter === undefined ? this.constructor.name : nameWhenAsEmitter;
    this.currentIndent = currentIndent === undefined ? 0 : currentIndent;
    this.currentIndentString = globalConvertOptions.indent.repeat(this.currentIndent);

    this.deprecatedFields = new Map<string, string | undefined>();
    this.mandatoryFields = new Set<string>();
    this.fieldUnhandledHandlers = new Map<string, FieldHandler<any>>();
    this.fieldPreprocessors = new Map<string, FieldPreprocessor>();
    this.fields = new Map<string, FieldRegistration[]>();

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
    this.deprecatedFields.set(name, replacement);
  }
  protected registerFieldMandatory (name: string) {
    this.mandatoryFields.add(name);
  }
  protected registerOnFieldUnhandled (name: string, handler: FieldHandler<any>) {
    this.fieldUnhandledHandlers.set(name, handler);
  }
  protected registerFieldPreprocessor (name: string, preprocessor: FieldPreprocessor) {
    this.fieldPreprocessors.set(name, preprocessor);
  }

  // ---------------------------------
  //  field value handlers registrars
  // ---------------------------------

  protected registerField (name: string, type: Expectations, validator: FieldValidator<any>,
                           handler: FieldHandler<any>, expectations?: Expectations) {
    let regs = this.fields.get(name);
    if (regs === undefined) {
      this.fields.set(name, regs = new Array<FieldRegistration>());
    }
    regs.push({ type, validator, handler, expectations });
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
  protected handleStringArrayField (fieldName: string, acceptAnyway: boolean = true) {
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
  protected handleStringObjectField (fieldName: string, acceptAnyway: boolean = true) {
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
    this.fields.forEach((registrations, name) => {
      // if such field exists in json
      if (!(name in json)) {
        if (this.mandatoryFields.has(name)) {
          throw J2JError.fieldNotDefined(this, name);
        }
        return;
      }
      // check if deprecated/removed
      if (this.deprecatedFields.has(name)) {
        const replacement = this.deprecatedFields.get(name);
        if (replacement === undefined) {
          QuickConsole.warnRemoved(this, name);
        } else {
          QuickConsole.warnDeprecated(this, name, replacement);
        }
      }
      let handled = false;
      let value = json[name];
      // preprocess
      const preprocessor = this.fieldPreprocessors.get(name);
      if (preprocessor !== undefined) {
        value = preprocessor(value);
      }
      // go through all registrations
      const expectations = new Set<Expectation>();
      registrations.forEach(reg => {
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
        if (this.fieldUnhandledHandlers.has(name)) {
          (this.fieldUnhandledHandlers.get(name) as FieldHandler<any>)(value, json);
        } else if (this.mandatoryFields.has(name)) {
          throw J2JError.typeError(this, name, Array.from(expectations));
        } else {
          QuickConsole.warnIgnoreField(this, name, Array.from(expectations));
        }
      }
    });
    // fields that have no registration
    Lodash.filter(Lodash.keys(json), key => !this.fields.has(key))
      .forEach(key => QuickConsole.warnUnrecognizable(this, key));
  }
}

import Console from './Console';
import J2JError from './J2JError';

export type Expectation = string | null
          | StringConstructor | ArrayConstructor | ObjectConstructor | NumberConstructor | BooleanConstructor;
export type Expectations = Expectation | Expectation[];

export function formatExpectations (expectations: Expectations) {
  if (!Array.isArray(expectations)) {
    expectations = [ expectations ];
  }
  expectations = expectations.map(expectation => {
    switch (expectation) {
      case null:  return 'null';
      case String:  return 'a string';
      case Array:   return 'a JsonArray';
      case Object:  return 'a JsonObject';
      case Number:  return 'a number';
      case Boolean: return 'a boolean value';
      default:      return expectation as string;
    }
  });
  switch (expectations.length) {
    case 0:
      throw new J2JError(null, 'QuickConsole.expectationFormatter arguemnt expectation is an empty array');
    case 1:
      return `is not ${expectations[0]}`;
    case 2:
      return `is neither ${expectations[0]} nor ${expectations[1]}`;
    default:
      const LAST_EXPECTATION = expectations.pop();
      return `is not one of ${expectations.join(', ')} or ${LAST_EXPECTATION}`;
  }
}

export default class QuickConsole {

  /**
   * Warn field had been deprecated and what should be used instead
   */
  public static warnDeprecated (emitter: any, fieldName: string, replacement: string) {
    Console.warn(emitter,
      `field '${fieldName}' is deprecated and may be removed in the future, please use '${replacement}' instead`);
  }
  /**
   * Warn field feature has been removed
   */
  public static warnRemoved (emitter: any, fieldName: string) {
    Console.warn(emitter, `field '${fieldName}' had been removed in json-to-java scheme, and it will be ignored`);
  }
  /**
   * Warn field type/value issue and another value would be used instead
   */
  public static warnTypeWithReplacement (
      emitter: any, fieldName: string, expectations: Expectations, replacement: string) {
    expectations = formatExpectations(expectations);
    replacement = replacement ? `value ${replacement}` : 'default value';
    Console.warn(emitter, `value of field '${fieldName}' ${expectations}, ${replacement} will be used`);
  }
  /**
   * Warn field type issue and its value would be ignored
   */
  public static warnIgnoreField (emitter: any, fieldName: string, expectations: Expectations) {
    expectations = formatExpectations(expectations);
    Console.warn(emitter, `field '${fieldName}' will be ignored since its value ${expectations}`);
  }
  /**
   * Warn element type issue of an Array field
   */
  public static warnElementType (
      emitter: any, fieldName: string, index: number, length: number, expectations: Expectations) {
    expectations = formatExpectations(expectations);
    Console.warn(emitter,
      `value of element ${index + 1}/${length} in field \'${fieldName}\' ${expectations}`);
  }
  /**
   * Warn key type issue in a key-value field
   */
  public static warnValueTypeOfKey (
      emitter: any, fieldName: string, key: string, expectations: Expectations) {
    expectations = formatExpectations(expectations);
    Console.warn(emitter, `value of key ${key} in field \'${fieldName}\' ${expectations}`);
  }

}

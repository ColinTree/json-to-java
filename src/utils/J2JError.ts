import Console from './Console';
import { Expectations, formatExpectations } from './QuickConsole';

export default class J2JError extends Error {

  public static typeError (emitter: any, fieldName: string, expectations: Expectations) {
    expectations = formatExpectations(expectations);
    return new J2JError(emitter, `value of field '${fieldName}' ${expectations}`);
  }
  public static elementTypeError (
      emitter: any, fieldName: string, index: number, length: number, expectations: Expectations) {
    expectations = formatExpectations(expectations);
    return new J2JError(emitter,
      `value of element ${index + 1}/${length} in field \'${fieldName}\' ${expectations}`);
  }
  public static fieldNotDefined (emitter: any, fieldName: string) {
    return new J2JError(emitter, `field '${fieldName}' must be defined`);
  }
  public static valueNotAccepted (emitter: any, fieldName: string, value: any) {
    return new J2JError(emitter, `value of field '${fieldName}' '${value}' connot be accepted`);
  }

  public constructor (emitter: any, message: any) {
    super(Console.stringifyEmitter(emitter)
        ? `${Console.stringifyEmitter(emitter)} ${message}`
        : message);
  }
}

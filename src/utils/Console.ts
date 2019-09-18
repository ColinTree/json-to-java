import J2JError from './J2JError';

// tslint:disable no-console

export default class Console {

  public static LOG_INTERCEPTOR: ((emitter: any, message: any) => void) | null = null;
  public static WARNING_INTERCEPTOR: ((emitter: any, message: any) => void) | null = null;
  public static ERROR_INTERCEPTOR: ((emitter: any, err: any) => void) | null = null;

  public static stringifyEmitter (emitter: any) {
    if (emitter === null || emitter === undefined) {
      return '';
    }
    if (typeof emitter === 'string') {
      return `[ ${emitter} ]`;
    }
    const name = emitter.name ? ` (${emitter.name})` : '';
    if (emitter.nameWhenAsEmitter) {
      return `[ ${emitter.nameWhenAsEmitter}${name} ]`;
    }
    if (emitter.constructor) {
      return `[ ${emitter.constructor.name}${name} ]`;
    }
    return '';
  }

  public static log (emitter: any, message: any) {
    if (this.LOG_INTERCEPTOR) {
      this.LOG_INTERCEPTOR(emitter, message);
    } else {
      console.log(`[ J2J ][ Log ]${this.stringifyEmitter(emitter)}`, message);
    }
  }
  public static warn (emitter: any, message: any) {
    if (this.WARNING_INTERCEPTOR) {
      this.WARNING_INTERCEPTOR(emitter, message);
    } else {
      console.warn(`[ J2J ][ Warning ]${this.stringifyEmitter(emitter)}`, message);
    }
  }

  public static error (emitter: any, err: any) {
    if (!(err instanceof Error)) {
      err = new J2JError(null, err);
    }
    if (this.ERROR_INTERCEPTOR) {
      this.ERROR_INTERCEPTOR(emitter, err);
    } else {
      console.error(err);
      console.error(`[ J2J ][ Error ]${this.stringifyEmitter(emitter)}`, 'An error had occured:', err.message);
    }
  }

  private constructor () {}
}

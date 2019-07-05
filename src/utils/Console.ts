// tslint:disable no-console

export default class Console {

  public static log (message: any) {
    String(message).split('\n').forEach(line => {
      console.log('[ J2J ][ Log ]', line);
    });
  }
  public static error (message: any) {
    String(message).split('\n').forEach(line => {
      console.error('[ J2J ][Error]', line);
    });
  }

  private constructor () {}
}

import {JsonObject} from './json';
import QuickConsole from './QuickConsole';

interface ConvertOptions {
  indent: string;
}
function defaultConvertOptions (): ConvertOptions {
  return { indent: '    ' };
}
export const globalConvertOptions: ConvertOptions = defaultConvertOptions();

export function parseConvertOptions (emitter: any, convertOptions: JsonObject) {
  if ('indent' in convertOptions) {
    if (typeof convertOptions.indent === 'number') {
      globalConvertOptions.indent = ' '.repeat(convertOptions.indent);
    } else if (convertOptions.indent === 'tab') {
      globalConvertOptions.indent = '\t';
    } else {
      QuickConsole.warnIgnoreField(emitter, 'convertOptions.indent', [ Number, 'string "tab"' ]);
    }
  }
}

interface ConvertOptions {
  indent: string;
}
function defaultConvertOptions (): ConvertOptions {
  return { indent: '    ' };
}
export const globalConvertOptions: ConvertOptions = defaultConvertOptions();

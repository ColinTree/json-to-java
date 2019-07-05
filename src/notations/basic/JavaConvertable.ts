export default interface JavaConvertable {
  toJava (indentationSize: number, currentIndent: number): string;
}

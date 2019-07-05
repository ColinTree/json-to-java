import commandLineArgs from 'command-line-args';
import fs from 'fs-extra';
import JsonToJava from '.';
import Console from './utils/Console';

const FLAG_DEFAULT_OUTPUT = '%SAME_PATH_AND_NAME_WITH_INPUT%';

const options = commandLineArgs([
  { name: 'src',    alias: 's', defaultValue: 'input.json' },
  { name: 'output', alias: 'o', defaultValue: FLAG_DEFAULT_OUTPUT },
]) as { src: string, output: string };

if (options.output === FLAG_DEFAULT_OUTPUT) {
  options.output = options.src + '.java';
}

Console.log('JsonToJava:');
Console.log(`- src=${options.src}`);
Console.log(`- output=${options.output}`);

if (!fs.existsSync(options.src)) {
  Console.error(`Source file not found: ${options.src}`);
  process.exit();
}

try {
  const result = JsonToJava(String(fs.readFileSync(options.src)));
  fs.writeFileSync(options.output, result);
  Console.log(`Result had already written to ${options.output}`);
} catch (e) {
  Console.error((e as Error).stack);
}

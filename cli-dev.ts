import commandLineArgs from 'command-line-args';
import fs from 'fs-extra';
import JsonToJava from './src';
import Console from './src/utils/Console';

const FLAG_DEFAULT_OUTPUT = '%SAME_PATH_AND_NAME_WITH_INPUT%';

const options = commandLineArgs([
  { name: 'src',    alias: 's', defaultValue: 'input.json' },
  { name: 'output', alias: 'o', defaultValue: FLAG_DEFAULT_OUTPUT },
]);

if (options.output === FLAG_DEFAULT_OUTPUT) {
  options.output = options.src + '.java';
}

Console.log(null, 'JsonToJava:');
Console.log(null, `- src=${options.src}`);
Console.log(null, `- output=${options.output}`);

if (!fs.existsSync(options.src)) {
  Console.error(null, `Source file not found: ${options.src}`);
  process.exit();
}

try {
  const result = JsonToJava(String(fs.readFileSync(options.src)));
  fs.writeFileSync(options.output, result);
  Console.log(null, `Result had already written to ${options.output}`);
} catch (e) {
  Console.error(null, e as any);
}

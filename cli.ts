// tslint:disable no-console
import commandLineArgs from 'command-line-args';
import fs from 'fs-extra';
import JsonToJava from './src';

const FLAG_DEFAULT_OUTPUT = '%SAME_PATH_AND_NAME_WITH_INPUT%';
const LOG_PREFIX = '[ J2J ][ Log ]';
const ERROR_PREFIX = '[ J2J ][Error]';

const options = commandLineArgs([
  { name: 'src',    alias: 's', defaultValue: 'input.json' },
  { name: 'output', alias: 'o', defaultValue: FLAG_DEFAULT_OUTPUT },
]);

if (options.output === FLAG_DEFAULT_OUTPUT) {
  options.output = options.src + '.java';
}

console.log(LOG_PREFIX, 'JsonToJava:');
console.log(LOG_PREFIX, `- src=${options.src}`);
console.log(LOG_PREFIX, `- output=${options.output}`);

if (!fs.existsSync(options.src)) {
  console.error(ERROR_PREFIX, `Source file not found: ${options.src}`);
  process.exit();
}

try {
  const result = JsonToJava(String(fs.readFileSync(options.src)));
  fs.writeFileSync(options.output, result);
  console.log(LOG_PREFIX, `Result had already written to ${options.output}`);
} catch (e) {
  console.error(LOG_PREFIX, e);
}

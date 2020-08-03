import commandLineArgs from 'command-line-args';
import fs from 'fs-extra';
import os from 'os';
import JsonToJava from './src';
import Console from './src/utils/Console';

const FLAG_DEFAULT_SRC = '%NO_SRC_SPECIFIED%';
const DEV_SRC_PATH_CACHE = os.tmpdir() + '/.j2j-cli-dev-src-path-cache';
const DEFAULT_SRC_PATH = 'input.json';
const FLAG_DEFAULT_OUTPUT = '%SAME_PATH_AND_NAME_WITH_INPUT%';

const options = commandLineArgs([
  { name: 'src',    alias: 's', defaultValue: FLAG_DEFAULT_SRC },
  { name: 'output', alias: 'o', defaultValue: FLAG_DEFAULT_OUTPUT },
]);

if (options.src === FLAG_DEFAULT_SRC || !options.src.endsWith('.json')) {
  options.src = DEFAULT_SRC_PATH;
  if (fs.existsSync(DEV_SRC_PATH_CACHE)) {
    const cache = fs.readFileSync(DEV_SRC_PATH_CACHE);
    if (fs.existsSync(cache)) {
      Console.log('dev', 'Applying cached src path');
      options.src = cache;
    }
  }
}
if (options.src !== FLAG_DEFAULT_SRC) {
  fs.writeFileSync(DEV_SRC_PATH_CACHE, options.src);
}
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

# json-to-java

## format about source json

see sample files in `./sample-input-json/`

## run via npm scripts

```shell
$ npm run %script_name%
```

* build
  - building project using `tsc`, will produce `bin` dirctory
* dev
  - use `ts-node` to run `src/NodeEntry.ts` with default arguments directly
* start
  - run `bin/NodeEntry.js`

## run with out npm scripts

NodeEntry accepts arguments:

* --src (-s) path to source json file
* --output (-o) path to output java file

try run uncompiled .ts files directly
```shell
$ ts-node src/NodeEntry.ts -s path/to/src.json -o path/to/output.java
```
OR run compiled js files:
```shell
$ node . -s path/to/src.json -o path/to/output.java
```
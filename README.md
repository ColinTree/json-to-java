# json-to-java

## how to use

```shell
$ json-to-java -s path/to/src.json -o path/to/output.java
```

`json-to-java` accepts arguments:

* --src (-s)
  * path to source json file
  * default to `input.json`
* --output (-o) path to output java file
  * default to `%arguemnt_src%.java`, e.g. `input.json.java`

## format about source json

see sample files in `./sample-input-json/`
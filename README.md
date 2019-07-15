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
  * default to `%arguemnt::src%.java`, e.g. `input.json.java`

## format of source json

Sample file see in directory `sample-input-json`

Should be a JsonObject

* `convertOptions`
  * optional, default to empty object
  * **Accept type**: [ConvertOptions](#ConvertOptions)
* `package`
  * optional, default to empty string (would not be convert)
  * **Accept type**: `string`
* `imports`
  * optional, default to empty array
  * **Accept type**: `string[]`
* `mainClass`
  * **required**
  * **Accept type**: [JavaClass](#JavaClass)
* `otherClasses`
  * optional, default to empty array
  * **Accept type**: [JavaClass](#JavaClass)[]

### ConvertOptions

Should be a JsonObject

* indent
  * optional, default to indent size `4`
  * **Accept value**: a number or `"tab"`

### JavaClass

Should be a JsonObject

* `annotations`
  * optional, default to empty array
  * **Accept type**: [JavaAnnotation](#JavaAnnotation)[]
* `accessModifier`
  * optional, default to `null`
  * **Accept values**: `null` or `"public"` or `"private"` or `"protected"`
* `nonAccessModifiers`
  * optional, default to empty array
  * **Accept values**: `string[]`
    * repeated value will not be checked (**TODO**: add check to this)
    * each element should be one of: `"static"` or `"final"` or `"abstract"` or `"transient"` or `"synchronized"` or `"volatile"`
* `name`
  * **required**
  * **Accept type**: `string`
    * validtor: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
* `extends`
  * optional, only become effective when a value is set
  * **Accept type**: `string`
* `implements`
  * optional, default to empty array
  * **Accept types**
    * `string` would be read as an single-value array
    * `string[]`
* `attributes`
  * optional, default to empty array
  * **Accept type**: [JavaAttributes](#JavaAttributes)[]
* `constructors`
  * optional, default to empty array
  * **Accept type**: [JavaConstructor](#JavaConstructor)[]
* `methods`
  * optional, default to empty array
  * **Accept type**: [JavaClassMethod](#JavaClassMethod)[]
* `classes`
  * optional, default to empty array
  * **Accept type**: [JavaClass](#JavaClass)[]

### JavaAnnotation

Should be a JsonObject

* `name`
  * **required**
  * **Accept type**: `string`
    * validtor: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
* `values`
  * optional, default to `null`
  * **Accept value/types**
    * `null`: no values, as *MarkerAnnotation*
    * `string`: represent to a single value, as *SingleValueAnnotation*
    * `{ [key: string]: string }`: represent to key-value pairs, as FullAnnotation

### JavaClassAttributes

Should be a JsonObject

* `accessModifier`
  * optional, default to `null`
  * **Accept values**: `null` or `"public"` or `"private"` or `"protected"`
* `nonAccessModifiers`
  * optional, default to empty array
  * **Accept values**: `string[]`
    * repeated value will not be checked (**TODO**: add check to this)
    * each element should be one of: `"static"` or `"final"` or `"abstract"` or `"transient"` or `"synchronized"` or `"volatile"`
* `type`
  * required
  * **Accept type**: `string`
* `name`
  * **required**
  * **Accept type**: `string`
    * validtor: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
* `value`
  * optional, default to `null`
  * **Accept value/type**
    * `null`: this attribute would have no initial value
    * `string`: string like `"0"` or `"\"String value\""`

### JavaClassConstructor

Should be a JsonObject

* `accessModifier`
  * optional, default to `null`
  * **Accept values**: `null` or `"public"` or `"private"` or `"protected"`
* `name`
  * **required**
  * **Accept type**: `string`
    * validtor: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
* `arguments`
  * optional, default to empty array
  * **Accept type**: [JavaVariableDifinition](#JavaVariableDifinition)[]
* `statements`
  * optional, default to empty array
  * **Accept type**: [JavaStatement](#JavaStatement)[]

### JavaClassMethod

Should be a JsonObject

* `annotations`
  * optional, default to empty array
  * **Accept type**: [JavaAnnotation](#JavaAnnotation)[]
* `accessModifier`
  * optional, default to `null`
  * **Accept values**: `null` or `"public"` or `"private"` or `"protected"`
* `nonAccessModifiers`
  * optional, default to empty array
  * **Accept values**: `string[]`
    * repeated value will not be checked (**TODO**: add check to this)
    * each element should be one of: `"static"` or `"final"` or `"abstract"` or `"transient"` or `"synchronized"` or `"volatile"`
* `type`
  * required
  * **Accept type**: `string`
* `name`
  * **required**
  * **Accept type**: `string`
    * validtor: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
* `arguments`
  * optional, default to empty array
  * **Accept type**: [JavaVariableDifinition](#JavaVariableDifinition)[]
* `statements`
  * optional, default to empty array
  * **Accept type**: [JavaStatement](#JavaStatement)[]

### JavaVariableDifinition

Should be a JsonObject

* `final`
  * optional, default to `false`
  * **Accept type**: `boolean` (`true` or `false`)
* `type`
  * required
  * **Accept type**: `string`

### JavaStatement

A JavaStatement can be:

* `string` as a statement line
* `JavaStatement[]` as a nested code block, indentation would be increased automatically

Sample: 

```ts
const statements: JavaStatement[] = [
  "if (true) {",
  [
    "while (false) {",
    [ "// unreachable" ],
    "}"
  ],
  "} else {",
  [ "throw new RuntimeException();" ],
  "}"
]
```

would be converted into:
```java
if (true) {
  while (false) {
    // unreachable
  }
} else {
  throw new RuntimeException();
}
```
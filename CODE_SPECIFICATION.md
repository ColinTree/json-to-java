# code specification of this project

When handling exceptions:

* Do no throw Error, throw J2JError (using J2JError static functions would be great)
* Throw J2JError when:
  * there exist a default value of the field, or
  * field value can be ignored (this actually equivalent to "null as default value")
* Otherwise, use `QuickConsole` or `Console.warn` instead

When handling a field:

* There should be one condition in the root `if`, which is `if ('xxx' in json)`, type check and other checks should be inside of it
* Check its value type and don't left `else` blank, handle it

When checking a json type:

* Use `JsonUtil.isJsonObject` && `JsonUtil.isJsonArray` instead of `typeof` or `Array.isArray`

(Other see `tslint.json`)
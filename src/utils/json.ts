import Lodash from 'lodash';

export type Json = null | string | number | boolean | JsonArray | JsonObject;
export interface JsonArray extends Array<Json> {}
export interface JsonObject extends Lodash.Dictionary<Json> {}

export const JsonUtil = {
  isJsonArray (json: Json): json is JsonArray {
    return Array.isArray(json);
  },
  isJsonObject (json: Json): json is JsonObject {
    return typeof json === 'object' && !this.isJsonArray(json) && json !== null;
  },
};

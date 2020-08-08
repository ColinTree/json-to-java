import Lodash from 'lodash';

export type Json = null | string | number | boolean | JsonArray | JsonObject;
export interface JsonArray extends Array<Json> {}
export interface JsonObject extends Lodash.Dictionary<Json> {}

function isJsonArray (json: Json): json is JsonArray {
  return Array.isArray(json);
}

function isJsonObject (json: Json): json is JsonObject {
  return typeof json === 'object' && !isJsonArray(json) && json !== null;
}

export const JsonUtil = { isJsonArray, isJsonObject };

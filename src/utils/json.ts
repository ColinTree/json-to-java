export type Json = undefined | null | string | number | boolean | JsonArray | JsonObject;
export interface JsonArray extends Array<Json> {}
export interface JsonObject {
  [key: string]: Json;
}

export const JsonUtil = {
  isJsonArray (json: Json) {
    return Array.isArray(json);
  },
  isJsonObject (json: Json) {
    return typeof json === 'object' && !this.isJsonArray(json) && json !== null;
  },
};

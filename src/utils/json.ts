export type Json = null | string | number | boolean | JsonArray | JsonObject;
export interface JsonArray extends Array<Json> {}
export interface JsonObject {
  [key: string]: Json;
}

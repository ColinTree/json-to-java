export type Json = string | number | boolean | JsonArray | JsonObject;
export interface JsonArray extends Array<Json> {}
export interface JsonObject {
  [key: string]: Json;
}

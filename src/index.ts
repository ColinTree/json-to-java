import JavaSingleFile from './notations/SingleFile';
import { JsonObject } from './utils/json';

export default function JsonToJava (json: string | JsonObject): string {
  if (typeof json === 'string') {
    json = JSON.parse(json) as JsonObject;
  }
  return new JavaSingleFile(json).toString();
}

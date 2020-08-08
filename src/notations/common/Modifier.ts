import J2JError from '../../utils/J2JError';
import {JsonArray} from '../../utils/json';

export type JavaAccessModifier = null | 'public' | 'private' | 'protected';
export type JavaNonAccessModifier = 'static' | 'final' | 'abstract' | 'transient' | 'synchronized' | 'volatile';

export function isJavaAccessModifier (value: any) {
  return value === null || [ 'public', 'private', 'protected' ].includes(value);
}

function isJavaNonAccessModifier (value: any) {
  return [ 'static', 'final', 'abstract', 'transient', 'synchronized', 'volatile' ].includes(value);
}
export function parseNonAccessModifiers (
    emitter: any, fieldName: string, receiver: JavaNonAccessModifier[], nonAccessModifiers: JsonArray) {
  nonAccessModifiers.forEach(nonAccessModifier => {
    if (!isJavaNonAccessModifier(nonAccessModifier)) {
      throw J2JError.valueNotAccepted(emitter, fieldName, nonAccessModifier);
    }
    receiver.push(nonAccessModifier as JavaNonAccessModifier);
  });
}

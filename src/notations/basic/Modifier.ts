export type JavaAccessModifier = null | 'public' | 'private' | 'protected';
export type JavaNonAccessModifier = 'static' | 'final' | 'abstract' | 'transient' | 'synchronized' | 'volatile';

export function isJavaAccessModifier (value: any) {
  return value === null || [ 'public', 'private', 'protected' ].includes(value);
}
export function isJavaNonAccessModifier (value: any) {
  return [ 'static', 'final', 'abstract', 'transient', 'synchronized', 'volatile' ].includes(value);
}

export type JavaAccessModifier = null | 'public' | 'private' | 'protected';
export type JavaNonAccessModifier = 'static' | 'final' | 'abstract' | 'transient' | 'synchronized' | 'volatile';

export function isJavaAccessModifier (s: null | string) {
  return s === null || [ 'public', 'private', 'protected' ].includes(s);
}
export function isJavaNonAccessModifier (s: string) {
  return [ 'static', 'final', 'abstract', 'transient', 'synchronized', 'volatile' ].includes(s);
}

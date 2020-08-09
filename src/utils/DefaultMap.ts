export default class DefaultMap<K, V> extends Map<K, V> {
  constructor (private valueConstructor: any) {
    super();
  }
  public get (key: K): V {
    let value = super.get(key);
    if (value === undefined) {
      this.set(key, value = new this.valueConstructor() as V);
    }
    return value;
  }
}

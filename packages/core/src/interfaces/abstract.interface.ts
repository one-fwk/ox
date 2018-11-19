export interface Abstract<T> {
  new (...args: any[]): T;
  prototype: T;
}
export const definePropertyValue = (obj: any, propertyKey: string, value: any) => {
  // minification shortcut
  Object.defineProperty(obj, propertyKey, {
    configurable: true,
    value
  });
};

export const definePropertyGetterSetter = (obj: any, propertyKey: string, get: any, set: any) => {
  // minification shortcut
  Object.defineProperty(obj, propertyKey, {
    configurable: true,
    get,
    set
  });
};
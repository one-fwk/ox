export const definePropertyValue = (obj: any, memberName: string, value: any) => {
  // minification shortcut
  Object.defineProperty(obj, memberName, {
    configurable: true,
    value,
  });
};

export const definePropertyGetterSetter = (obj: any, memberName: string, get: any, set: any) => {
  // minification shortcut
  Object.defineProperty(obj, memberName, {
    configurable: true,
    get,
    set,
  });
};
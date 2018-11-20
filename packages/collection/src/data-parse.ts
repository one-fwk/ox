import { isDef } from './util';
import { PropertyType } from './interfaces';
import { PROP_TYPE } from './constants';

export const parsePropertyValue = (propType: PropertyType | PROP_TYPE, propValue: any) => {
  // ensure this value is of the correct prop type
  // we're testing both formats of the "propType" value because
  // we could have either gotten the data from the attribute changed callback,
  // which wouldn't have Constructor data yet, and because this method is reused
  // within proxy where we don't have meta data, but only constructor data

  if (isDef(propValue) && typeof propValue !== 'object' && typeof propValue !== 'function') {
    if ((propType as PropertyType) === Boolean || (propType as PROP_TYPE) === PROP_TYPE.Boolean) {
      // per the HTML spec, any string value means it is a boolean true value
      // but we'll cheat here and say that the string "false" is the boolean false
      return (propValue === 'false' ? false : propValue === '' || !!propValue);
    }

    if ((propType as PropertyType) === Number || (propType as PROP_TYPE) === PROP_TYPE.Number) {
      // force it to be a number
      return parseFloat(propValue);
    }

    if ((propType as PropertyType) === String || (propType as PROP_TYPE) === PROP_TYPE.String) {
      // could have been passed as a number or boolean
      // but we still want it as a string
      return propValue.toString();
    }
  }

  // not sure exactly what type we want
  // so no need to change to a different type
  return propValue;
};

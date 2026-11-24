export type FlattenedValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | null
  | undefined;

interface INestedObject {
  [key: string]: FlattenedValue | INestedObject;
}

function isObjectValue<T>(value: T): value is T & object {
  return typeof value === 'object' && value !== null;
}

function isFlattenedValue<T>(value: T): value is T & FlattenedValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    Array.isArray(value)
  );
}

export function flattenObject<T extends object>(
  object: T,
  prefix = '',
  result: Record<string, FlattenedValue | INestedObject> = {}
): Record<string, FlattenedValue | INestedObject> {
  Object.keys(object).forEach((key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = object[key as keyof T];
    if (isObjectValue(value) && !Array.isArray(value)) {
      if (Object.keys(value).length === 0) {
        result[path] = {};
      } else {
        flattenObject(value, path, result);
      }
    } else if (isFlattenedValue(value)) {
      result[path] = value;
    } else {
      throw new TypeError(`Unsupported configuration value at "${path}"`);
    }
  });

  return result;
}

export function unflattenObject<T extends object>(
  object: Record<string, FlattenedValue | INestedObject>
): T {
  const result: INestedObject = {};

  Object.keys(object).forEach((path) => {
    const keys = path.split('.');
    let current = result;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = object[path];
        return;
      }

      const child = current[key];
      if (
        typeof child === 'object' &&
        child !== null &&
        !Array.isArray(child)
      ) {
        current = child;
      } else {
        const nested: INestedObject = {};
        current[key] = nested;
        current = nested;
      }
    });
  });

  return result as T;
}

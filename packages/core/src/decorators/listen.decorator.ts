import { Metadata } from '../collection';

/**
 * Listen for any event changes
 * @param event
 * @decorator
 */
export function Listen(event: string): MethodDecorator {
  return (target, propertyKey) => {
    Metadata.listeners.add({
      target: target.constructor,
      propertyKey,
      event,
    });
  };
}
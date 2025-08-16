export function Injectable() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Mark the constructor as injectable
    (constructor as any).__injectable = true;
    return constructor;
  };
}

export function isInjectable(constructor: any): boolean {
  return constructor.__injectable === true;
}

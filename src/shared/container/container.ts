class DIContainer {
  private services = new Map<string, any>();
  private instances = new Map<string, any>();

  register<T>(
    token: string,
    serviceClass: new (...args: any[]) => T,
    dependencies: string[] = []
  ): void {
    this.services.set(token, { serviceClass, dependencies });
  }

  get<T>(token: string): T {
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    const serviceData = this.services.get(token);
    if (!serviceData) {
      throw new Error(`Service ${token} not found`);
    }

    const { serviceClass: ServiceClass, dependencies } = serviceData;
    const resolvedDependencies = dependencies.map((dep: string) =>
      this.get(dep)
    );
    const instance = new ServiceClass(...resolvedDependencies);

    this.instances.set(token, instance);
    return instance;
  }

  clear(): void {
    this.instances.clear();
  }
}

export const container = new DIContainer();

import type { OAuthProvider } from '@wdev-studio/nest-auth-types';

export class ProviderRegistry {
  private readonly providers = new Map<string, OAuthProvider>();

  register(provider: OAuthProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Provider "${provider.name}" already registered`);
    }
    this.providers.set(provider.name, provider);
  }

  get(name: string): OAuthProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider "${name}" not found`);
    }
    return provider;
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }

  getAll(): OAuthProvider[] {
    return Array.from(this.providers.values());
  }

  getNames(): string[] {
    return Array.from(this.providers.keys());
  }
}

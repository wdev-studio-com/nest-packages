import type { DatabaseAdapter } from '@wdev-studio/nest-auth-types';

export class AdapterRegistry {
  private adapter?: DatabaseAdapter;

  register(adapter: DatabaseAdapter): void {
    this.adapter = adapter;
  }

  get(): DatabaseAdapter | undefined {
    return this.adapter;
  }

  has(): boolean {
    return this.adapter !== undefined;
  }
}

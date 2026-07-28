import type { EventBus as IEventBus, AuthEventPayload, EventHandler } from '@wdev-studio/nest-auth-types';
import { AuthEvent } from '@wdev-studio/nest-auth-types';

export class EventBus implements IEventBus {
  private readonly listeners = new Map<AuthEvent, Set<EventHandler>>();

  async emit(event: AuthEvent, payload?: Omit<AuthEventPayload, 'event'>): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    const full: AuthEventPayload = { event, ...payload };
    await Promise.allSettled(Array.from(handlers).map((h) => h(full)));
  }

  on(event: AuthEvent, handler: EventHandler): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: AuthEvent, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }
}

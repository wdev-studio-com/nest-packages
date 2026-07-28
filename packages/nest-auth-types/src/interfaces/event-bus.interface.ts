import type { AuthEvent } from '../enums/auth-event.enum';

export interface AuthEventPayload {
  event: AuthEvent;
  provider?: string;
  userId?: string;
  tokenId?: string;
  error?: Error;
  metadata?: Record<string, unknown>;
}

export type EventHandler = (payload: AuthEventPayload) => void | Promise<void>;

export interface EventBus {
  emit(event: AuthEvent, payload?: Omit<AuthEventPayload, 'event'>): Promise<void>;
  on(event: AuthEvent, handler: EventHandler): void;
  off(event: AuthEvent, handler: EventHandler): void;
}

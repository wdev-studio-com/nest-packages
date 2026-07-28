import { describe, it, expect } from 'bun:test';
import { AuthEvent } from '@wdev-studio/nest-auth-types';
import { EventBus } from '../core/event-bus/event-bus';

describe('EventBus', () => {
  it('should emit and handle events', async () => {
    const bus = new EventBus();
    let handled = false;

    bus.on(AuthEvent.AfterLogin, () => {
      handled = true;
    });

    await bus.emit(AuthEvent.AfterLogin, { provider: 'google' });
    expect(handled).toBe(true);
  });

  it('should support multiple handlers', async () => {
    const bus = new EventBus();
    let count = 0;

    bus.on(AuthEvent.BeforeLogin, () => { count++; });
    bus.on(AuthEvent.BeforeLogin, () => { count++; });

    await bus.emit(AuthEvent.BeforeLogin);
    expect(count).toBe(2);
  });

  it('should remove handlers', async () => {
    const bus = new EventBus();
    let count = 0;

    const handler = () => { count++; };
    bus.on(AuthEvent.AfterLogin, handler);
    bus.off(AuthEvent.AfterLogin, handler);

    await bus.emit(AuthEvent.AfterLogin);
    expect(count).toBe(0);
  });

  it('should not fail with no handlers', async () => {
    const bus = new EventBus();
    await bus.emit(AuthEvent.AfterLogin);
  });
});

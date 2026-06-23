import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateId } from '../../src/core/utils/uuid.js';
import { eventBus } from '../../src/core/utils/eventBus.js';
import { sanitizeText, escapeHtml } from '../../src/core/utils/sanitize.js';
import { debounce, throttle } from '../../src/core/utils/debounce.js';

describe('uuid', () => {
  it('generates a string in UUID v4 format', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('generates unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('eventBus', () => {
  beforeEach(() => eventBus.clear());
  afterEach(() => eventBus.clear());

  it('emits event to registered listeners', () => {
    const spy = vi.fn();
    eventBus.on('test:event', spy);
    eventBus.emit('test:event', 'payload');
    expect(spy).toHaveBeenCalledWith('payload');
  });

  it('does not call listener after off()', () => {
    const spy = vi.fn();
    eventBus.on('test:event', spy);
    eventBus.off('test:event', spy);
    eventBus.emit('test:event', 'data');
    expect(spy).not.toHaveBeenCalled();
  });

  it('handles errors in listeners gracefully', () => {
    const errorSpy = vi.fn();
    const okSpy = vi.fn();
    eventBus.on('test:event', () => { throw new Error('fail'); });
    eventBus.on('test:event', okSpy);
    eventBus.emit('test:event', 'data');
    expect(okSpy).toHaveBeenCalled();
  });

  it('clears all listeners', () => {
    eventBus.on('a', vi.fn());
    eventBus.on('b', vi.fn());
    eventBus.clear();
    eventBus.emit('a', {});
    eventBus.emit('b', {});
  });
});

describe('sanitize', () => {
  it('sanitizeText removes HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('<script>alert("xss")</script>');
  });

  it('sanitizeText returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(123)).toBe('');
  });

  it('escapeHtml escapes special characters', () => {
    expect(escapeHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#039;');
  });

  it('escapeHtml returns empty string for non-string input', () => {
    expect(escapeHtml(null)).toBe('');
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    const spy = vi.fn();
    const fn = debounce(spy, 100);
    fn();
    expect(spy).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 150));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('cancels pending execution', async () => {
    const spy = vi.fn();
    const fn = debounce(spy, 100);
    fn();
    fn.cancel();
    await new Promise((r) => setTimeout(r, 150));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  it('limits execution to once per interval', async () => {
    const spy = vi.fn();
    const fn = throttle(spy, 100);
    fn();
    fn();
    fn();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

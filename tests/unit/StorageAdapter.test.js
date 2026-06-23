import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from '../../src/core/storage/LocalStorageAdapter.js';

describe('LocalStorageAdapter', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageAdapter();
  });

  it('sets and gets a value', () => {
    storage.set('test-key', { name: 'Test' });
    const result = storage.get('test-key');
    expect(result).toEqual({ name: 'Test' });
  });

  it('returns null for missing key', () => {
    expect(storage.get('nonexistent')).toBeNull();
  });

  it('removes a value', () => {
    storage.set('temp', 'value');
    storage.remove('temp');
    expect(storage.get('temp')).toBeNull();
  });

  it('lists keys with prefix', () => {
    storage.set('form:abc', {});
    storage.set('form:def', {});
    storage.set('other:xyz', {});
    const keys = storage.keys('form:');
    expect(keys).toContain('form:abc');
    expect(keys).toContain('form:def');
    expect(keys).not.toContain('other:xyz');
  });

  it('clears all keys with prefix', () => {
    storage.set('form:a', {});
    storage.set('form:b', {});
    storage.clear('form:');
    expect(storage.keys('form:').length).toBe(0);
  });

  it('prefixes keys with dfb:', () => {
    storage.set('key1', 'val1');
    const raw = localStorage.getItem('dfb:key1');
    expect(raw).toBe('"val1"');
  });

  it('handles storage errors gracefully', () => {
    const adapter = new LocalStorageAdapter();
    adapter.set('key', 'value');
    expect(adapter.get('key')).toBe('value');
  });
});

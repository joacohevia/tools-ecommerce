/**
 * Setup global para tests del frontend (jsdom).
 * Se ejecuta una vez antes de cada archivo de test.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Stub de localStorage para tests de CarritoContext
vi.stubGlobal('localStorage', {
  _store: {},
  getItem: vi.fn((key) => localStorage._store[key] ?? null),
  setItem: vi.fn((key, val) => { localStorage._store[key] = String(val); }),
  removeItem: vi.fn((key) => { delete localStorage._store[key]; }),
  clear: vi.fn(() => { localStorage._store = {}; }),
});

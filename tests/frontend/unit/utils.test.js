/**
 * Tests unitarios para src/lib/utils.js — función cn().
 */
import { describe, expect, it } from 'vitest';
import { cn } from '../../../src/lib/utils';

describe('cn', () => {
  it('une clases con espacio', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filtra valores undefined', () => {
    expect(cn('a', undefined, 'c')).toBe('a c');
  });

  it('filtra valores null', () => {
    expect(cn('a', null, 'c')).toBe('a c');
  });

  it('filtra valores false', () => {
    expect(cn('a', false, 'c')).toBe('a c');
  });

  it('filtra valores vacios', () => {
    expect(cn('a', '', 'c')).toBe('a c');
  });

  it('maneja clases condicionales', () => {
  const isActive = true;
  const isDisabled = false;
  expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('devuelve string vacio si todo es falsy', () => {
    expect(cn(undefined, null, false, '')).toBe('');
  });
});

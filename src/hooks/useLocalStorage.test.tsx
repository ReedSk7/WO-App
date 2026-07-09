import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('reads and writes values safely', () => {
    localStorage.clear();
    const { result } = renderHook(() => useLocalStorage('woac:test', { value: 'initial' }));
    expect(result.current[0]).toEqual({ value: 'initial' });

    act(() => result.current[1]({ value: 'updated' }));

    expect(result.current[0]).toEqual({ value: 'updated' });
    expect(JSON.parse(localStorage.getItem('woac:test') ?? '{}')).toEqual({ value: 'updated' });
  });
});

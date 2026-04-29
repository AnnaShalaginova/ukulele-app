import { expect, test } from 'vitest';
import { transposeChord } from './transposer';

test('transposes C up by 1 semitone to C#', () => {
  expect(transposeChord('C', 1)).toBe('C#');
});

test('transposes C up by 2 semitones to D', () => {
  expect(transposeChord('C', 2)).toBe('D');
});

test('transposes G up by 5 semitones to C', () => {
  expect(transposeChord('G', 5)).toBe('C');
});

test('transposes Am up by 2 semitones to Bm', () => {
  expect(transposeChord('Am', 2)).toBe('Bm');
});

test('transposes Bb down by 1 semitone to A', () => {
  expect(transposeChord('Bb', -1)).toBe('A');
});

test('transposes F up by 12 semitones to F', () => {
  expect(transposeChord('F', 12)).toBe('F');
});

test('transposes D down by 2 semitones to C', () => {
  expect(transposeChord('D', -2)).toBe('C');
});

test('handles complex chords like Dmaj7', () => {
  expect(transposeChord('Dmaj7', 1)).toBe('D#maj7');
});

test('handles flat chords like Eb', () => {
  expect(transposeChord('Eb', 1)).toBe('E');
});

test('wraps around correctly with negative transposition', () => {
  expect(transposeChord('C', -1)).toBe('B');
});

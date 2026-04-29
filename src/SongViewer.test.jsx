import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';
import SongViewer from './SongViewer';

test('transposes chords in SongViewer when buttons are clicked', () => {
  const songProps = {
    title: 'Test Song',
    chordsInput: '[C]Hello [G]world',
    strumming: 'D-D-U',
    youtubeUrl: '',
    bpm: '90'
  };

  render(<SongViewer {...songProps} />);

  // Initial chords
  expect(screen.getAllByText('C').length).toBeGreaterThan(0);
  expect(screen.getAllByText('G').length).toBeGreaterThan(0);

  // Click +1
  const plusOneButton = screen.getByText('+1');
  fireEvent.click(plusOneButton);

  // Chords should be transposed to C# and G#
  expect(screen.getAllByText('C#').length).toBeGreaterThan(0);
  expect(screen.getAllByText('G#').length).toBeGreaterThan(0);
  expect(screen.queryByText('C')).toBeNull();

  // Click Reset
  const resetButton = screen.getByText('Reset');
  fireEvent.click(resetButton);

  // Back to C and G
  expect(screen.getAllByText('C').length).toBeGreaterThan(0);
  expect(screen.getAllByText('G').length).toBeGreaterThan(0);
});

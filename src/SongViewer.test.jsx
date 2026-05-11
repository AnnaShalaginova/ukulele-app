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

test('handles multiple chords in one measure', () => {
  const songProps = {
    title: 'Multi Chord Song',
    chordsInput: '[C G]Hello',
    strumming: '',
    youtubeUrl: '',
    bpm: ''
  };

  render(<SongViewer {...songProps} />);

  // Should show both chords in the text
  expect(screen.getByText('C G')).toBeDefined();

  // Diagrams section should show both C and G titles
  // We use getAllByText because 'C' and 'G' might appear in the lyrics too if we are not careful
  // But here 'Hello' doesn't contain C or G.
  // Actually, 'C' and 'G' will be in the chord diagrams as titles (h4).
  const chordTitles = screen.getAllByRole('heading', { level: 4 });
  const titles = chordTitles.map(t => t.textContent);
  expect(titles).toContain('C');
  expect(titles).toContain('G');
});

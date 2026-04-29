const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chord, semitones) {
  if (!chord) return chord;
  if (semitones === 0) return chord;

  // Extract root and suffix
  // Handles roots like C, C#, Db, F#, etc.
  const rootMatch = chord.match(/^([A-G][#b]?)(.*)/);
  if (!rootMatch) return chord;

  const root = rootMatch[1];
  const suffix = rootMatch[2];

  // Find current index
  let index = notesSharp.indexOf(root);
  if (index === -1) {
    index = notesFlat.indexOf(root);
  }

  if (index === -1) return chord; // Should not happen for valid chords

  // Calculate new index
  let newIndex = (index + semitones) % 12;
  while (newIndex < 0) newIndex += 12;

  // Determine whether to use sharps or flats
  // A simple heuristic: if the original was a flat, use flats. If it was a sharp, use sharps.
  // Otherwise, default to sharps (or common preferences).
  const useFlats = root.includes('b') || (semitones < 0 && !root.includes('#'));
  const newRoot = useFlats ? notesFlat[newIndex] : notesSharp[newIndex];

  return newRoot + suffix;
}

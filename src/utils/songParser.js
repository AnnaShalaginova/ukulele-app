/**
 * Parses a song string in the format "[C]Lyrics" into structured data.
 * Returns an array of lines, where each line is an array of segments.
 * Each segment has a 'chord' (optional) and 'text'.
 */
export function parseSong(text) {
  if (!text) return [];

  const lines = text.split("\n");
  
  return lines.map(line => {
    const segments = [];
    const regex = /\[(.*?)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Text before the chord
      if (match.index > lastIndex) {
        segments.push({
          chord: null,
          text: line.substring(lastIndex, match.index)
        });
      }

      // The chord and the text immediately following it (until the next chord or end of line)
      const nextMatch = line.indexOf("[", regex.lastIndex);
      const segmentText = nextMatch === -1 
        ? line.substring(regex.lastIndex) 
        : line.substring(regex.lastIndex, nextMatch);

      segments.push({
        chord: match[1],
        text: segmentText
      });

      lastIndex = regex.lastIndex + segmentText.length;
      regex.lastIndex = lastIndex; // Skip the text we just consumed
    }

    // If there's no chords in the line at all
    if (segments.length === 0) {
      segments.push({ chord: null, text: line });
    }

    return segments;
  });
}

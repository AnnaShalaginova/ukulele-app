import React, { useState } from "react";
import { parseSong } from "./utils/songParser";
import ChordDiagram from "./ChordDiagram";
import { chordShapes } from "./data/chords";
import { transposeChord } from "./utils/transposer";

const SongViewer = ({ title, chordsInput, strumming, youtubeUrl, bpm }) => {
  const [transpose, setTranspose] = useState(0);
  const parsedLines = parseSong(chordsInput);

  // Extract unique chords to show diagrams at the top
  const chordRegex = /\[(.*?)\]/g;
  const matches = [...chordsInput.matchAll(chordRegex)];
  const uniqueChords = [...new Set(matches.map(m => m[1]))];

  const handleTranspose = (amount) => {
    setTranspose(prev => prev + amount);
  };

  const resetTranspose = () => {
    setTranspose(0);
  };

  return (
    <div className="song-viewer">
      <div className="viewer-header">
        <h2>{title}</h2>
        <div className="viewer-controls" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Transpose:</span>
          <button className="secondary-btn" onClick={() => handleTranspose(-1)}>-1</button>
          <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
            {transpose > 0 ? `+${transpose}` : transpose}
          </span>
          <button className="secondary-btn" onClick={() => handleTranspose(1)}>+1</button>
          {transpose !== 0 && (
            <button className="cancel-btn" onClick={resetTranspose} style={{ marginLeft: '10px' }}>Reset</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {strumming && (
            <p className="viewer-strumming" style={{ margin: 0 }}>
              <strong>Strumming:</strong> {strumming}
            </p>
          )}
          {bpm && (
            <p className="viewer-bpm" style={{ margin: 0 }}>
              <strong>BPM:</strong> {bpm}
            </p>
          )}
        </div>
        {youtubeUrl && (
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="viewer-youtube">
            📺 Watch on YouTube
          </a>
        )}
      </div>

      {/* CHORD DIAGRAMS SECTION */}
      <div className="viewer-chords">
        {uniqueChords.map(chord => {
          const transposed = transposeChord(chord, transpose);
          return <ChordDiagram key={chord} chord={transposed} shape={chordShapes[transposed]} />;
        })}
      </div>

      {/* LYRICS & CHORDS SECTION */}
      <div className="viewer-content">
        {parsedLines.map((line, lineIndex) => (
          <div key={lineIndex} className="viewer-line">
            {line.map((segment, segIndex) => (
              <span key={segIndex} className="viewer-segment">
                {segment.chord && (
                  <span className="viewer-chord">
                    {transposeChord(segment.chord, transpose)}
                  </span>
                )}
                <span className="viewer-text">{segment.text || "\u00A0"}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongViewer;

import React, { useState } from "react";
import { parseSong } from "./utils/songParser";
import ChordDiagram from "./ChordDiagram";
import { chordShapes } from "./data/chords";
import { transposeChord } from "./utils/transposer";
import { SECTION_TAGS } from "./App";

const SongViewer = ({ title, chordsInput, strumming, youtubeUrl, bpm, songId }) => {
  const [transpose, setTranspose] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const parsedLines = parseSong(chordsInput);

  // Extract unique chords to show diagrams at the top
  const chordRegex = /\[(.*?)\]/g;
  const matches = [...chordsInput.matchAll(chordRegex)];
  const uniqueChords = [...new Set(matches.flatMap(m => m[1].split(/\s+/)).filter(c => {
    if (!c) return false;
    const isSection = SECTION_TAGS.some(tag => 
      c.toLowerCase().startsWith(tag.toLowerCase())
    );
    return !isSection;
  }))];

  const handleTranspose = (amount) => {
    setTranspose(prev => prev + amount);
  };

  const resetTranspose = () => {
    setTranspose(0);
  };

  const handleShare = async () => {
    if (!songId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${songId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="song-viewer">
      <div className="viewer-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2>{title}</h2>
          {songId && (
            <button className="doc-pill" onClick={handleShare} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              {isCopying ? "✅ Copied!" : "🔗 Share Link"}
            </button>
          )}
        </div>
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
        {parsedLines.map((line, lineIndex) => {
          if (line.isSectionHeader) {
            return (
              <div key={lineIndex} className="viewer-section-header">
                {line.text}
              </div>
            );
          }

          return (
            <div key={lineIndex} className="viewer-line">
              {line.segments.map((segment, segIndex) => (
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
          );
        })}
      </div>
    </div>
  );
};

export default SongViewer;

import React, { useState, useEffect } from "react";

const validRoots = [
  "A","B","C","D","E","F","G",
  "Am","Bm","Cm","Dm","Em","Fm","Gm",
  "A7","B7","C7","D7","E7","F7","G7",
  "Amaj7","Cmaj7","Dmaj7","Emaj7","Fmaj7","Gmaj7"
];

export default function App() {
  const [title, setTitle] = useState("");
  const [chordsInput, setChordsInput] = useState("");
  const [strumming, setStrumming] = useState("");
  const [formattedChords, setFormattedChords] = useState([]);
  const [error, setError] = useState("");
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ukuleleSongs")) || [];
    setSongs(saved);
  }, []);

  const validateChords = (chords) => {
    return chords.every(chord => validRoots.includes(chord));
  };

  const formatChords = () => {
    setError("");
    const chords = chordsInput.trim().split(/\s+/);

    if (!validateChords(chords)) {
      setError("One or more chords are invalid.");
      return;
    }

    const grouped = [];
    for (let i = 0; i < chords.length; i += 4) {
      grouped.push(chords.slice(i, i + 4));
    }

    setFormattedChords(grouped);
  };

  const saveSong = () => {
    if (!title) {
      setError("Please enter a song title.");
      return;
    }

    const newSong = { title, chordsInput, strumming };
    const updatedSongs = [...songs, newSong];
    setSongs(updatedSongs);
    localStorage.setItem("ukuleleSongs", JSON.stringify(updatedSongs));
    setError("");
  };

  const loadSong = (song) => {
    setTitle(song.title);
    setChordsInput(song.chordsInput);
    setStrumming(song.strumming);
    setFormattedChords([]);
  };

  const printSong = () => {
    window.print();
  };

  return (
    <div className="container">
      <h1>Ukulele Song Builder 🎸</h1>

      <input
        placeholder="Song Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Enter chords separated by spaces (e.g., C G Am F)"
        value={chordsInput}
        onChange={(e) => setChordsInput(e.target.value)}
      />

      <input
        placeholder="Strumming Pattern (e.g., D-DU-UDU)"
        value={strumming}
        onChange={(e) => setStrumming(e.target.value)}
      />

      <div className="buttons">
        <button onClick={formatChords}>Format</button>
        <button onClick={saveSong}>Save</button>
        <button onClick={printSong}>Print</button>
      </div>

      {error && <p className="error">{error}</p>}

      {strumming && (
        <div className="strumming">
          <strong>Strumming Pattern:</strong> {strumming}
        </div>
      )}

      <div className="output">
        {formattedChords.map((group, index) => (
          <div key={index} className="chord-row">
            {group.map((chord, i) => (
              <div key={i} className="chord">
                {chord}
              </div>
            ))}
          </div>
        ))}
      </div>

      <h2>Saved Songs</h2>
      <ul>
        {songs.map((song, index) => (
          <li key={index}>
            <button onClick={() => loadSong(song)}>
              {song.title}
            </button>
          </li>
        ))}
      </ul>

      <style>{`
        .container {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          font-family: Arial;
        }

        input, textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          font-size: 16px;
        }

        textarea {
          height: 80px;
        }

        .buttons button {
          margin-right: 10px;
          padding: 8px 16px;
          cursor: pointer;
        }

        .error {
          color: red;
        }

        .output {
          margin-top: 20px;
        }

        .chord-row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
          font-size: 20px;
          font-weight: bold;
        }

        .chord {
          min-width: 50px;
          text-align: center;
        }

        .strumming {
          margin-top: 15px;
          font-size: 18px;
        }

        @media print {
          button, textarea, input, ul, h2 {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

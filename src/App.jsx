import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import ChordDiagram from "./ChordDiagram";
import SongViewer from "./SongViewer";
import { chordShapes } from "./data/chords";
import "./App.css";

const sampleSong = `[C]Row, row, row your [G]boat
[C]Gently down the [G]stream
[C]Merrily, merrily, [F]merrily, merrily
[C]Life is but a [G]dream`;

// =============================
// EXTRACT CHORDS FROM TEXT
// =============================
function extractChords(text) {
  if (!text) return [];
  const chordRegex = /\[(.*?)\]/g;
  const matches = [...text.matchAll(chordRegex)];
  const chords = matches.map(match => match[1].trim());
  return [...new Set(chords)];
}

function App() {
  const [user, setUser] = useState(null);

  // =============================
  // STATE
  // =============================
  const [title, setTitle] = useState("");
  const [chordsInput, setChordsInput] = useState("");
  const [strumming, setStrumming] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [bpm, setBpm] = useState("");
  const [chordsUsed, setChordsUsed] = useState(""); // NEW FIELD
  const [editingId, setEditingId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Detect chords for diagrams based on the main text area
  const chords = extractChords(chordsInput);

  // =============================
  // AUTH
  // =============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchSongs();
    }
  }, [user]);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSongs([]);
  }

  // =============================
  // FETCH SONGS
  // =============================
  async function fetchSongs() {
    if (!user) return;

    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setSongs(data || []);
    }
  }

  // =============================
  // SAVE / UPDATE SONG
  // =============================
  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    const songData = {
      title,
      chords_input: chordsInput,
      strumming,
      youtube_url: youtubeUrl,
      bpm: bpm ? parseInt(bpm) : null,
      chords_used: chordsUsed, // SAVE TO DB
      user_id: user.id,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from("songs")
        .update(songData)
        .eq("id", editingId)
        .select();
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("songs")
        .insert([songData])
        .select();
      error = insertError;
    }

    if (error) {
      console.error("Supabase Error:", error);
      alert("Error saving: " + error.message);
    } else {
      alert(editingId ? "Song updated successfully! ✨" : "Song saved to library! 🎵");
      clearForm();
      fetchSongs();
    }
  }

  function clearForm() {
    setTitle("");
    setChordsInput("");
    setStrumming("");
    setYoutubeUrl("");
    setBpm("");
    setChordsUsed("");
    setEditingId(null);
    setIsViewMode(false);
  }

  function loadSampleSong() {
    setEditingId(null);
    setTitle("Row Row Row Your Boat");
    setChordsInput(sampleSong);
    setStrumming("D-D-U-U-D-U");
    setYoutubeUrl("");
    setBpm("90");
    setChordsUsed("C, G, F");
    setIsViewMode(false);
  }

  function loadSong(song) {
    setEditingId(song.id);
    setTitle(song.title);
    setChordsInput(song.chords_input);
    setStrumming(song.strumming);
    setYoutubeUrl(song.youtube_url || "");
    setBpm(song.bpm ? song.bpm.toString() : "");
    setChordsUsed(song.chords_used || ""); // LOAD FROM DB
    setIsViewMode(false);
  }

  async function deleteSong(id) {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    const { error } = await supabase.from("songs").delete().eq("id", id);
    if (!error) fetchSongs();
  }

  // =============================
  // FILTERED SONGS LOGIC
  // =============================
  const filteredSongs = songs.filter(song => {
    if (!searchQuery) return true;
    
    const query = searchQuery.trim().toLowerCase().replace(/[\[\]]/g, '');
    
    // 1. Search in the NEW "Chords Used" field (Strict Chord Search)
    const matchesChordsUsed = (song.chords_used || "").toLowerCase().includes(query);

    // 2. Fallback: Search in the raw text (Just in case)
    const matchesRawText = (song.chords_input || "").toLowerCase().includes(query);
    
    return matchesChordsUsed || matchesRawText;
  });

  // =============================
  // NOT LOGGED IN
  // =============================
  if (!user) {
    return (
      <div className="container landing-page">
        <header className="hero">
          <h1>Ukulele App</h1>
          <p>Create, manage, and perform your favorite ukulele songs with ease.</p>
          <div className="ukulele-icon" style={{ marginTop: '20px' }}>
            <img src="ukulele-landing.png" alt="Ukulele" style={{ width: '200px', height: 'auto' }} />
          </div>
        </header>
        <div className="login-section">
          <button className="secondary-btn" onClick={signInWithGoogle} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
            Get Started with Google
          </button>
        </div>
      </div>
    );
  }

  // =============================
  // MAIN UI
  // =============================
  return (
    <div className="container">
      <div className="top-bar">
        <p>Welcome, <strong>{user.email}</strong></p>
        <button className="cancel-btn" onClick={signOut}>Sign Out</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src="ukulele-landing.png" alt="Ukulele" style={{ width: '120px', height: 'auto' }} />
      </div>

      <h1>Ukulele Song Builder</h1>

      {(editingId || (title && chordsInput)) && (
        <div className="view-toggle">
          <button className={`toggle-btn ${!isViewMode ? 'active' : ''}`} onClick={() => setIsViewMode(false)}>Edit Mode</button>
          <button className={`toggle-btn ${isViewMode ? 'active' : ''}`} onClick={() => setIsViewMode(true)}>Performance Mode</button>
        </div>
      )}

      <div className="main-layout">
        <div className="content-area">
          {isViewMode ? (
            <SongViewer 
              title={title} 
              chordsInput={chordsInput} 
              strumming={strumming} 
              youtubeUrl={youtubeUrl} 
              bpm={bpm} 
              chordsUsed={chordsUsed}
            />
          ) : (
            <form onSubmit={handleSubmit} className="song-form">
              <h2>{editingId ? "Edit Song" : "Create New Song"}</h2>
              
              <input 
                type="text" 
                placeholder="Song Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />

              <textarea 
                placeholder="Lyrics (put chords in brackets, e.g. [C]Row your boat)" 
                value={chordsInput} 
                onChange={(e) => setChordsInput(e.target.value)} 
                required 
              />

              {/* NEW CHORDS USED FIELD */}
              <input 
                type="text" 
                placeholder="Chords Used (e.g. C, G, Am, F)" 
                value={chordsUsed} 
                onChange={(e) => setChordsUsed(e.target.value)} 
              />

              {chords.length > 0 && (
                <div className="chord-diagrams">
                  {chords.map((chord) => (
                    <ChordDiagram key={chord} chord={chord} shape={chordShapes[chord]} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Strumming Pattern" value={strumming} onChange={(e) => setStrumming(e.target.value)} style={{ flex: 2 }} />
                <input type="number" placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value)} style={{ flex: 1 }} />
              </div>

              <input type="url" placeholder="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />

              <div className="form-actions">
                <button type="submit" className="primary-btn">{editingId ? "Update Song" : "Save Song"}</button>
                {(editingId || title || chordsInput) && (
                  <button type="button" className="cancel-btn" onClick={clearForm}>Clear / Cancel</button>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="song-list">
          <h2>Your Library</h2>
          
          <div className="search-box" style={{ marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Search by chord (e.g. G)" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box' }} 
            />
          </div>

          {filteredSongs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>No matches found 🔍</p>
          ) : (
            filteredSongs.map((song) => (
              <div key={song.id} className="song-card">
                <h3 className="clickable" onClick={() => loadSong(song)}>{song.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0" }}>
                  <strong>Chords:</strong> {song.chords_used || "—"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0" }}>
                  <strong>Style:</strong> {song.strumming || "—"} {song.bpm && ` | ${song.bpm} BPM`}
                </p>
                <div className="song-actions">
                  <button className="secondary-btn" onClick={() => loadSong(song)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteSong(song.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

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

  const chordRegex = /\[([A-G](#|b)?(m|7)?)\]/g;
  const matches = [...text.matchAll(chordRegex)];
  const chords = matches.map(match => match[1]);

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
  const [editingId, setEditingId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [songs, setSongs] = useState([]);

  // Detect chords automatically
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
      setSongs(data);
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
      user_id: user.id,
    };

    let error;
    let result;

    if (editingId) {
      console.log("Attempting to UPDATE song ID:", editingId);
      const { data, error: updateError } = await supabase
        .from("songs")
        .update(songData)
        .eq("id", editingId)
        .select(); // .select() forces Supabase to return the updated row
      
      error = updateError;
      result = data;
      console.log("Update result:", { data, error });
    } else {
      console.log("Attempting to INSERT new song");
      const { data, error: insertError } = await supabase
        .from("songs")
        .insert([songData])
        .select();
      
      error = insertError;
      result = data;
    }

    if (error) {
      console.error("Supabase Error:", error);
      alert("Error saving: " + error.message);
    } else if (editingId && (!result || result.length === 0)) {
      console.warn("Update successful but 0 rows were affected. Check RLS policies.");
      alert("The update was successful, but no changes were saved. This usually happens if your Supabase 'Row Level Security' (RLS) policy doesn't allow UPDATES.");
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
    setEditingId(null);
    setIsViewMode(false);
  }

  // =============================
  // SAMPLE SONG
  // =============================
  function loadSampleSong() {
    setEditingId(null);
    setTitle("Row Row Row Your Boat");
    setChordsInput(sampleSong);
    setStrumming("D-D-U-U-D-U");
    setYoutubeUrl("");
    setIsViewMode(false); // Let user see the edit view first
  }

  // =============================
  // LOAD SONG
  // =============================
  function loadSong(song) {
    setEditingId(song.id);
    setTitle(song.title);
    setChordsInput(song.chords_input);
    setStrumming(song.strumming);
    setYoutubeUrl(song.youtube_url || "");
    setIsViewMode(false); // ALWAYS open in EDIT MODE so user can update immediately
  }

  // =============================
  // DELETE SONG
  // =============================
  async function deleteSong(id) {
    if (!window.confirm("Are you sure you want to delete this song?")) return;

    const { error } = await supabase
      .from("songs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
    } else {
      fetchSongs();
    }
  }

  // =============================
  // NOT LOGGED IN (Landing Page)
  // =============================
  if (!user) {
    return (
      <div className="container landing-page">
        <header className="hero">
          <h1>Ukulele App</h1>
          <p>Create, manage, and perform your favorite ukulele songs with ease.</p>
          <div className="ukulele-icon" style={{ marginTop: '20px' }}>
            <img 
              src="ukulele-landing.png" 
              alt="Ukulele" 
              style={{ width: '200px', height: 'auto' }} 
            />
          </div>
        </header>

        <section className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🎼</div>
            <h3>Smart Chords</h3>
            <p>Automatic chord detection and visual SVG diagrams for every song.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎤</div>
            <h3>Performance Mode</h3>
            <p>Clean, distraction-free view with chords positioned perfectly above lyrics.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Sync</h3>
            <p>Save your entire song library and access it from any device.</p>
          </div>
        </section>

        <div className="login-section">
          <button className="secondary-btn" onClick={signInWithGoogle} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
            Get Started with Google
          </button>
          <p>Sign in to save your songs and access your library.</p>
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
        <p>
          Welcome, <strong>{user.email}</strong>
        </p>
        <button className="cancel-btn" onClick={signOut}>Sign Out</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img 
          src="ukulele-landing.png" 
          alt="Ukulele" 
          style={{ width: '120px', height: 'auto' }} 
        />
      </div>

      <h1>Ukulele Song Builder</h1>

      {/* VIEW / EDIT TOGGLE (only when a song is being worked on) */}
      {(editingId || (title && chordsInput)) && (
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${!isViewMode ? 'active' : ''}`}
            onClick={() => setIsViewMode(false)}
          >
            Edit Mode
          </button>
          <button 
            className={`toggle-btn ${isViewMode ? 'active' : ''}`}
            onClick={() => setIsViewMode(true)}
          >
            Performance Mode
          </button>
        </div>
      )}

      {!editingId && !title && !chordsInput && (
        <div className="sample-option" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={loadSampleSong}
          >
            Load Sample Song
          </button>
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
            />
          ) : (
            /* FORM */
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
                placeholder="Chords / Lyrics (e.g. [C]Row your boat)"
                value={chordsInput}
                onChange={(e) => setChordsInput(e.target.value)}
                required
              />

              {chords.length > 0 && (
                <div className="chord-diagrams">
                  {chords.map((chord) => (
                    <ChordDiagram
                      key={chord}
                      chord={chord}
                      shape={chordShapes[chord]}
                    />
                  ))}
                </div>
              )}

              <input
                type="text"
                placeholder="Strumming Pattern (e.g. D-D-U-U-D-U)"
                value={strumming}
                onChange={(e) => setStrumming(e.target.value)}
              />

              <input
                type="url"
                placeholder="YouTube URL (optional)"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {editingId ? "Update Song" : "Save Song"}
                </button>
                {(editingId || title || chordsInput) && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={clearForm}
                  >
                    Clear / Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* SONG LIST */}
        <div className="song-list">
          <h2>Your Library</h2>

          {songs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>
              Your library is empty. Add your first song!
            </p>
          ) : (
            songs.map((song) => (
              <div key={song.id} className="song-card">
                <h3
                  className="clickable"
                  onClick={() => loadSong(song)}
                >
                  {song.title}
                </h3>

                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0" }}>
                  <strong>Strumming:</strong> {song.strumming || "—"}
                </p>

                {song.youtube_url && (
                  <p style={{ fontSize: "0.85rem", margin: "5px 0 0 0" }}>
                    <a href={song.youtube_url} target="_blank" rel="noopener noreferrer" className="clickable">
                      📺 Watch on YouTube
                    </a>
                  </p>
                )}

                <div className="song-actions">
                  <button className="secondary-btn" onClick={() => loadSong(song)}>
                    Edit / Perform
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteSong(song.id)}
                  >
                    Delete
                  </button>
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

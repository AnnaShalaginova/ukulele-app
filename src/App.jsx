import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { supabase } from "./supabase";
import ChordDiagram from "./ChordDiagram";
import SongViewer from "./SongViewer";
import ContactForm from "./ContactForm";
import { chordShapes } from "./data/chords";
import "./App.css";

const sampleSong = `[C]Row, row, row your [G]boat
[C]Gently down the [G]stream
[C]Merrily, merrily, [F]merrily, merrily
[C]Life is but a [G]dream`;

export const SECTION_TAGS = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro', 'Solo', 'Interlude'];

// =============================
// EXTRACT CHORDS FROM TEXT
// =============================
function extractChords(text) {
  if (!text) return [];
  const chordRegex = /\[(.*?)\]/g;
  const matches = [...text.matchAll(chordRegex)];
  const chords = matches.flatMap(match => match[1].split(/\s+/)).filter(c => {
    if (!c) return false;
    // Filter out section tags (case-insensitive)
    const isSection = SECTION_TAGS.some(tag => 
      c.toLowerCase().startsWith(tag.toLowerCase())
    );
    return !isSection;
  });
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
  const [chordsUsed, setChordsUsed] = useState(""); 
  const [editingId, setEditingId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharedSong, setSharedSong] = useState(null);
  const [featuredSong, setFeaturedSong] = useState(null);

  // Detect chords for diagrams based on the main text area
  const chords = extractChords(chordsInput);

  // =============================
  // FEATURED SONG LOGIC
  // =============================
  useEffect(() => {
    fetchFeaturedSong();
  }, []);

  async function fetchFeaturedSong() {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("is_featured", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching featured song:", error);
    } else {
      setFeaturedSong(data);
    }
  }

  // =============================
  // SHARED SONG LOGIC
  // =============================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("share");
    if (sharedId) {
      fetchSharedSong(sharedId);
    }
  }, []);

  async function fetchSharedSong(id) {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching shared song:", error);
    } else {
      setSharedSong(data);
    }
  }

  async function saveSharedSong(songToSave) {
    if (!user) {
      alert("Please sign in to save this song to your library!");
      return;
    }

    const songData = {
      title: songToSave.title,
      chords_input: songToSave.chords_input,
      strumming: songToSave.strumming,
      youtube_url: songToSave.youtube_url,
      bpm: songToSave.bpm,
      chords_used: songToSave.chords_used,
      user_id: user.id,
    };

    const { error } = await supabase.from("songs").insert([songData]);

    if (error) {
      alert("Error cloning song: " + error.message);
    } else {
      track('shared_song_cloned', { title: songToSave.title });
      alert("Song added to your library! 🎶");
      fetchSongs();
      closeSharedSong();
    }
  }

  function closeSharedSong() {
    setSharedSong(null);
    window.history.pushState({}, document.title, window.location.pathname);
  }

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
    track('google_signin_clicked');
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
      chords_used: chordsUsed, 
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
      track(editingId ? 'song_updated' : 'song_created', { title });
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
    setChordsUsed(song.chords_used || ""); 
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
    const matchesChordsUsed = (song.chords_used || "").toLowerCase().includes(query);
    const matchesRawText = (song.chords_input || "").toLowerCase().includes(query);
    
    return matchesChordsUsed || matchesRawText;
  });

  // =============================
  // MAIN UI
  // =============================
  return (
    <div className="container">
      {/* SHARED / FEATURED SONG VIEW */}
      {(sharedSong || featuredSong && isViewMode) && (
        <div className="shared-song-overlay">
          <div className="shared-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span>{sharedSong ? "📖 Viewing Shared Song" : "🌟 Song of the Week"}</span>
              {user ? (
                <button className="primary-btn" onClick={() => saveSharedSong(sharedSong || featuredSong)} style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                  Save to My Library
                </button>
              ) : (
                <button className="secondary-btn" onClick={signInWithGoogle} style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                  Sign in to Save
                </button>
              )}
            </div>
            <button className="cancel-btn" onClick={closeSharedSong}>Close Viewer</button>
          </div>
          <SongViewer 
            title={(sharedSong || featuredSong).title} 
            chordsInput={(sharedSong || featuredSong).chords_input} 
            strumming={(sharedSong || featuredSong).strumming} 
            youtubeUrl={(sharedSong || featuredSong).youtube_url} 
            bpm={(sharedSong || featuredSong).bpm} 
            songId={(sharedSong || featuredSong).id}
          />
          <hr className="shared-divider" />
        </div>
      )}

      {!user ? (
        /* LANDING PAGE (LOGGED OUT) */
        <div className="landing-page">
          <div className="ukulele-icon">
            <img src="ukulele-landing.png" alt="Ukulele" />
          </div>

          <header className="hero">
            <h1>Ukulele App</h1>
            <p>Create, manage, and perform your favorite ukulele songs with ease.</p>
            
            <div className="login-section">
              <button className="secondary-btn" onClick={signInWithGoogle}>
                Get Started with Google
              </button>
              <p>Sign in to save your songs and access your library.</p>
            </div>

            {featuredSong && (
              <div className="featured-song-card">
                <div className="featured-badge">🌟 SONG OF THE WEEK</div>
                <h3>{featuredSong.title}</h3>
                <p>{featuredSong.chords_used || "Standard Chords"}</p>
                <button className="primary-btn" onClick={() => setIsViewMode(true)}>
                  Play Now
                </button>
              </div>
            )}

            <div className="doc-links">
              <a href="https://github.com/AnnaShalaginova/ukulele-app/blob/main/PRD.md" target="_blank" rel="noopener noreferrer" className="doc-pill">
                📄 Product Roadmap
              </a>
              <a href="https://github.com/AnnaShalaginova/ukulele-app/blob/main/USER_GUIDE.md" target="_blank" rel="noopener noreferrer" className="doc-pill">
                📖 User Guide
              </a>
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

          <ContactForm />
        </div>
      ) : (
        /* MAIN APP (LOGGED IN) */
        <>
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
                  songId={editingId}
                />
              ) : (
                <form onSubmit={handleSubmit} className="song-form">
                  <h2>{editingId ? "Edit Song" : "Create New Song"}</h2>
                  <input type="text" placeholder="Song Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <textarea 
                    placeholder="Lyrics & Chords. Use [Verse], [Chorus], etc. on their own lines to create sections.
Example:
[Intro]
[C] [G]

[Verse]
[C]Row your boat..." 
                    value={chordsInput} 
                    onChange={(e) => setChordsInput(e.target.value)} 
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Chords & Structure (e.g. Intro: C, G | Verse: C, F, G)" 
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
                <input type="text" placeholder="Search by chord (e.g. G)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              {filteredSongs.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>No matches found 🔍</p>
              ) : (
                filteredSongs.map((song) => (
                  <div key={song.id} className="song-card">
                    <h3 className="clickable" onClick={() => loadSong(song)}>{song.title}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0" }}><strong>Chords / Structure:</strong> {song.chords_used || "—"}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0" }}><strong>Style:</strong> {song.strumming || "—"} {song.bpm && ` | ${song.bpm} BPM`}</p>
                    <div className="song-actions">
                      <button className="secondary-btn" onClick={() => loadSong(song)}>Edit</button>
                      <button className="delete-btn" onClick={() => deleteSong(song.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

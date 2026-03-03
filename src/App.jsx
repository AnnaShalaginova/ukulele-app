import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {
  const [user, setUser] = useState(null);

  // Song form state
  const [title, setTitle] = useState("");
  const [chordsInput, setChordsInput] = useState("");
  const [strumming, setStrumming] = useState("");
  const [songs, setSongs] = useState([]);

  // =============================
  // AUTH SETUP
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
  // SAVE SONG
  // =============================
  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("songs").insert([
      {
        title,
        chords_input: chordsInput,
        strumming,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setTitle("");
      setChordsInput("");
      setStrumming("");
      fetchSongs();
    }
  }

  // =============================
  // LOAD SONG
  // =============================
  function loadSong(song) {
    setTitle(song.title);
    setChordsInput(song.chords_input);
    setStrumming(song.strumming);
  }

  // =============================
  // DELETE SONG
  // =============================
  async function deleteSong(id) {
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
  // NOT LOGGED IN VIEW
  // =============================
  if (!user) {
    return (
      <div className="container">
        <h1>Ukulele Song Builder 🎸</h1>
        <button onClick={signInWithGoogle}>
          Sign In with Google
        </button>
        <style>{styles}</style>
      </div>
    );
  }

  // =============================
  // LOGGED IN VIEW
  // =============================
  return (
    <div className="container">
      <div className="top-bar">
        <p>
          Welcome, <strong>{user.email}</strong>
        </p>
        <button onClick={signOut}>Sign Out</button>
      </div>

      <h1>Ukulele Song Builder 🎸</h1>

      <div className="main-layout">
        {/* FORM */}
        <form onSubmit={handleSubmit} className="song-form">
          <input
            type="text"
            placeholder="Song Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Chords / Lyrics"
            value={chordsInput}
            onChange={(e) => setChordsInput(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Strumming Pattern"
            value={strumming}
            onChange={(e) => setStrumming(e.target.value)}
          />

          <button type="submit">Save Song</button>
        </form>

        {/* SONG LIST */}
        <div className="song-list">
          <h2>Your Songs</h2>

          {songs.length === 0 ? (
            <p>No songs yet 🎵</p>
          ) : (
            songs.map((song) => (
              <div key={song.id} className="song-card">
                <h3
                  className="clickable"
                  onClick={() => loadSong(song)}
                >
                  {song.title}
                </h3>

                <p>
                  <strong>Strumming:</strong>{" "}
                  {song.strumming || "—"}
                </p>

                <div className="song-actions">
                  <button onClick={() => loadSong(song)}>
                    Load
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

      <style>{styles}</style>
    </div>
  );
}

// =============================
// STYLES
// =============================
const styles = `
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f4f4f4;
  }

  .container {
    padding: 30px;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .main-layout {
    display: flex;
    gap: 40px;
    align-items: flex-start;
  }

  .song-form {
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  input, textarea {
    padding: 10px;
    font-size: 14px;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  button {
    padding: 10px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    border: none;
    background-color: #4CAF50;
    color: white;
  }

  button:hover {
    background-color: #45a049;
  }

  .song-list {
    width: 350px;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .song-card {
    background: #fafafa;
    padding: 12px;
    margin-bottom: 15px;
    border-radius: 8px;
    border: 1px solid #eee;
  }

  .song-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .delete-btn {
    background-color: #e74c3c;
  }

  .delete-btn:hover {
    background-color: #c0392b;
  }

  .clickable {
    cursor: pointer;
    color: #4CAF50;
  }

  .clickable:hover {
    text-decoration: underline;
  }
`;

export default App;
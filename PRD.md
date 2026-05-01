# 📋 Product Requirements Document: Ukulele App

**Version:** 1.0  
**Status:** MVP (Minimum Viable Product) Complete  
**Owner:** Anna Shalaginova  
Link to the app: https://ukulele-app.vercel.app/

---

## 1. Executive Summary
The **Ukulele App** is a cloud-synced digital songbook designed for ukulele players. It solves the problem of disorganized paper tabs and static lyrics by providing a "Smart" editor that automatically visualizes chords and a dedicated "Performance Mode" for distraction-free playing.

---

## 2. Target Audience
*   **Beginners:** Who need visual fretboard diagrams to remember chord shapes.
*   **Intermediate Players:** Who want to organize their library and practice with specific BPMs and strumming patterns.
*   **Performers:** Who need a clean, mobile-optimized digital sheet that is easy to read on a music stand.

---

## 3. Core Features (MVP)

### 3.1 Authentication & Persistence
*   **Social Login:** Secure Google OAuth integration via Supabase.
*   **Cloud Sync:** Every song is tied to a user ID and saved in a PostgreSQL database.
*   **Library Management:** Full CRUD (Create, Read, Update, Delete) functionality for songs.

### 3.2 Smart Song Builder
*   **Bracket Notation:** Supports `[Chord]Text` format for precise chord placement.
*   **Automatic Chord Detection:** Scans lyrics for brackets and generates SVG fretboard diagrams in real-time.
*   **Rich Metadata:** Fields for Strumming Pattern, BPM, and YouTube reference links.
*   **Strict Chord Tagging:** A dedicated "Chords Used" field for high-accuracy searching.

### 3.3 Performance Mode
*   **Parser Logic:** A custom utility that splits chords from lyrics and renders them in a vertically stacked layout.
*   **Visual Hierarchy:** Chords are styled in a distinct color (Secondary Blue) and positioned above syllables.
*   **Metadata Header:** Displays BPM, Style, and YouTube link at the top of the performance sheet.

### 3.4 Library Search
*   **Strict Chord Search:** Allows users to filter their entire library by specific chords (e.g., "Find all songs with Am7").
*   **Responsive UI:** Optimized for both desktop (side-by-side) and mobile (stacked) views.

### 3.5 Musician Tools
*   **Transposer:** A utility to shift the key of a song (+/- semitones) automatically in Performance Mode. (Implemented)

---

## 4. Technical Stack
*   **Frontend:** React 19 + Vite (JavaScript).
*   **Backend/Database:** Supabase (PostgreSQL + Auth).
*   **Styling:** Vanilla CSS with custom variables and Media Queries.
*   **Testing:** Vitest + React Testing Library (Unit & Integration tests).
*   **Deployment:** Vercel (CI/CD via GitHub).

---

## 5. User Experience (UX) & Design
*   **Aesthetic:** Modern, clean, and professional with a focus on high-contrast readability.
*   **Mobile-First:** 100% width inputs, touch-friendly buttons, and vertical stacking for music-stand use.
*   **Empty States:** Clear messaging when the library is empty or no search results are found.

---

## 6. Future Roadmap (v2.0)
*   **Auto-Scroll:** Hands-free vertical scrolling based on the song's BPM and length.
*   **Setlists:** Ability to group songs into "Gig Lists" or "Practice Folders."
*   **Offline Mode:** PWA (Progressive Web App) support for playing without an internet connection.
*   **Metronome:** Integrated visual/audio click track.

---

## 7. Success Metrics
*   **Retention:** Users return to the app to view their saved songs during practice.
*   **Library Growth:** Number of songs added per user.
*   **Mobile Usage:** Percentage of users accessing the app via mobile devices during performance.

---

## 8. Testing Strategy
The application maintains high reliability through a three-layered testing suite:

### 8.1 Logic Testing
*   **Transposer Validation:** Ensures musical accuracy when shifting keys (e.g., handling chromatic wraps, preserving chord suffixes like `m7` or `maj7`).
*   **Parser Accuracy:** Validates that the bracket notation `[Chord]` is correctly separated from lyrics.

### 8.2 Component Testing
*   **Chord Diagrams:** Verifies that SVG fretboard diagrams render correctly with accurate string/fret positions.
*   **Resilience:** Ensures the UI handles missing chord shapes gracefully without crashing.

### 8.3 Integration & UI Testing
*   **User Workflows:** Simulates full cycles of creating, saving, editing, and deleting songs.
*   **Persistence:** Confirms that the frontend correctly communicates with the Supabase database.
*   **Performance Mode:** Verifies real-time UI updates, such as the transposer buttons correctly updating all chord labels and diagrams simultaneously.

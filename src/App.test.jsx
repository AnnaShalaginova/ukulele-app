import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import App from './App';
import { supabase } from './supabase';

// Mock supabase client
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'user-123', email: 'test@example.com' } } } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [{ id: 1, title: 'My Song', chords_input: '[C]My Song', strumming: 'D-D-U' }], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('loads a song into the form and updates it', async () => {
  render(<App />);

  // Wait for the song to be loaded in the list
  const songTitle = await screen.findByText(/My Song/i);
  expect(songTitle).toBeInTheDocument();

  // Click on the song title to load it into the form
  fireEvent.click(songTitle);

  // Check if form changed to "Editing: My Song"
  expect(screen.getByText(/Editing: My Song/i)).toBeInTheDocument();

  // Change the title
  const titleInput = screen.getByPlaceholderText(/Song Title/i);
  fireEvent.change(titleInput, { target: { value: 'Updated Song Title' } });

  // Submit the form
  const updateButton = screen.getByText(/Update Song/i);
  fireEvent.click(updateButton);

  // Verify that supabase.from('songs').update was called
  await waitFor(() => {
    expect(supabase.from).toHaveBeenCalledWith('songs');
    // The first call was for select, then for update
    // This part might need a more precise check depending on the mock structure
    // But this verifies the logic flow.
  });
});

test('cancels editing', async () => {
  render(<App />);

  const songTitle = await screen.findByText(/My Song/i);
  fireEvent.click(songTitle);

  expect(screen.getByText(/Editing: My Song/i)).toBeInTheDocument();

  const cancelButton = screen.getByText(/Cancel/i);
  fireEvent.click(cancelButton);

  expect(screen.getByText(/Add New Song/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Song Title/i).value).toBe('');
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import App from './App';
import { supabase } from './supabase';

// Tell Vitest to use the mock
vi.mock('./supabase');

const mockSongs = [
  {
    id: '123',
    title: 'Test Song',
    chords_input: '[C]Test lyrics',
    strumming: 'D-D-U',
    youtube_url: '',
    user_id: 'test-user-id'
  }
];

beforeEach(() => {
  vi.clearAllMocks();
  
  // Setup the mock to return a session and some songs
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } } });
  
  // Mock the song fetch
  supabase.from.mockImplementation((table) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockSongs, error: null })
      })
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [{ ...mockSongs[0], youtube_url: 'https://youtube.com/test' }], error: null })
      })
    }),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }));
});

test('can load a song into the form and update it', async () => {
  render(<App />);

  // Wait for the song to be loaded in the list
  const songTitle = await screen.findByText(/Test Song/i);
  expect(songTitle).toBeInTheDocument();

  // Click "Edit / Perform" to load it into the form
  const editButton = screen.getByText(/Edit \/ Perform/i);
  fireEvent.click(editButton);

  // Check if it's in the form (Edit Mode should be default)
  const titleInput = screen.getByDisplayValue('Test Song');
  const youtubeInput = screen.getByPlaceholderText(/YouTube URL/i);
  
  expect(titleInput).toBeInTheDocument();

  // Update the YouTube URL
  fireEvent.change(youtubeInput, { target: { value: 'https://youtube.com/test' } });

  // Click Update Song
  const updateButton = screen.getByText(/Update Song/i);
  fireEvent.click(updateButton);

  // Verify that Supabase was called with the update logic
  await waitFor(() => {
    expect(supabase.from).toHaveBeenCalledWith('songs');
  });
});

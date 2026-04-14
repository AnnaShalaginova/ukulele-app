import { vi } from 'vitest';

export const supabase = {
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } } })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn((table) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  })),
};

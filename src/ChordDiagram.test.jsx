import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ChordDiagram from './ChordDiagram';

test('renders the chord name', () => {
  render(<ChordDiagram chord="C" shape={["0", "0", "0", "3"]} />);
  
  const chordElement = screen.getByText(/C/i);
  expect(chordElement).toBeInTheDocument();
});

test('renders the correct chord name', () => {
  render(<ChordDiagram chord="G" shape={["0", "2", "3", "2"]} />);
  
  const chordElement = screen.getByText(/G/i);
  expect(chordElement).toBeInTheDocument();
});

test('does not render if shape is missing', () => {
  const { container } = render(<ChordDiagram chord="C" shape={null} />);
  expect(container.firstChild).toBeNull();
});

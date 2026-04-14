import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ChordDiagram from './ChordDiagram';

test('renders the chord name correctly', () => {
  render(<ChordDiagram chord="C" shape={["0", "0", "0", "3"]} />);
  
  const chordElement = screen.getByText(/C/i);
  expect(chordElement).toBeInTheDocument();
});

test('renders the SVG fretboard grid', () => {
  const { container } = render(<ChordDiagram chord="C" shape={["0", "0", "0", "3"]} />);
  
  // Check if an SVG is rendered
  const svgElement = container.querySelector('svg');
  expect(svgElement).toBeInTheDocument();
  
  // Check for the presence of strings (usually 4 lines in a uke diagram)
  const lines = container.querySelectorAll('line');
  expect(lines.length).toBeGreaterThan(0);
});

test('does not render if shape is missing', () => {
  const { container } = render(<ChordDiagram chord="C" shape={null} />);
  expect(container.firstChild).toBeNull();
});

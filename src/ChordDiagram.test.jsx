import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ChordDiagram from './ChordDiagram';

test('renders the chord name', () => {
  render(<ChordDiagram chord="C" shape={["0", "0", "0", "3"]} />);
  
  const title = screen.getByText("C");
  expect(title).toBeInTheDocument();
});

test('renders the correct chord name', () => {
  render(<ChordDiagram chord="G" shape={["0", "2", "3", "2"]} />);
  
  const title = screen.getByText("G");
  expect(title).toBeInTheDocument();
});

test('does not render if shape is missing', () => {
  const { container } = render(<ChordDiagram chord="C" shape={null} />);
  expect(container.firstChild).toBeNull();
});

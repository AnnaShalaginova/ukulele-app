// ChordDiagram.jsx

function ChordDiagram({ chord, shape }) {
  if (!shape) return null;

  // Configuration for the SVG diagram
  const width = 80;
  const height = 100;
  const margin = { top: 20, right: 10, bottom: 10, left: 10 };
  const gridWidth = width - margin.left - margin.right;
  const gridHeight = height - margin.top - margin.bottom;
  
  const numStrings = 4;
  const numFrets = 4;
  
  const stringSpacing = gridWidth / (numStrings - 1);
  const fretSpacing = gridHeight / numFrets;

  return (
    <div className="chord-card">
      <h4 className="chord-title">{chord}</h4>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Fretboard Nut (Thick line at top) */}
        <line 
          x1={margin.left} y1={margin.top} 
          x2={margin.left + gridWidth} y2={margin.top} 
          stroke="black" strokeWidth="4" 
        />
        
        {/* Fret Lines */}
        {[1, 2, 3, 4].map((fret) => (
          <line
            key={`fret-${fret}`}
            x1={margin.left}
            y1={margin.top + fret * fretSpacing}
            x2={margin.left + gridWidth}
            y2={margin.top + fret * fretSpacing}
            stroke="gray"
            strokeWidth="1"
          />
        ))}

        {/* String Lines */}
        {[0, 1, 2, 3].map((string) => (
          <line
            key={`string-${string}`}
            x1={margin.left + string * stringSpacing}
            y1={margin.top}
            x2={margin.left + string * stringSpacing}
            y2={margin.top + gridHeight}
            stroke="black"
            strokeWidth="1"
          />
        ))}

        {/* Dots (Fingering) */}
        {shape.map((fretStr, stringIndex) => {
          const fret = parseInt(fretStr);
          if (isNaN(fret) || fret === 0) return null;
          
          return (
            <circle
              key={`dot-${stringIndex}`}
              cx={margin.left + stringIndex * stringSpacing}
              cy={margin.top + (fret - 0.5) * fretSpacing}
              r="4"
              fill="black"
            />
          );
        })}

        {/* Open/Muted indicator (Optional, showing 'o' for open) */}
        {shape.map((fretStr, stringIndex) => {
          if (fretStr !== "0") return null;
          return (
            <circle
              key={`open-${stringIndex}`}
              cx={margin.left + stringIndex * stringSpacing}
              cy={margin.top - 8}
              r="3"
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default ChordDiagram;
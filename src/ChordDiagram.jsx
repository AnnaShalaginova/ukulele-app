// ChordDiagram.jsx

function ChordDiagram({ chord, shape }) {
  if (!shape) return null;

  return (
    <div className="chord">
      <h4>{chord}</h4>

      <div className="diagram">
        {shape.map((fret, index) => (
          <div key={index} className="string">
            {fret}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChordDiagram;
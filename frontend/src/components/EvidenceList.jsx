import React from 'react';

const EvidenceList = ({ evidence }) => {
  return (
    <div>
      <h2>Preuves</h2>
      {evidence.map(ev => (
        <div key={ev._id} className="card" style={{ marginBottom: '10px' }}>
          <h4>{ev.type}</h4>
          <p>{ev.content}</p>
        </div>
      ))}
    </div>
  );
};

export default EvidenceList;
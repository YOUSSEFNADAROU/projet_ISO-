import React from 'react';

const SectionCard = ({ title, children }) => {
  return (
    <div className="card">
      {title && <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>{title}</h2>}
      {children}
    </div>
  );
};

export default SectionCard;
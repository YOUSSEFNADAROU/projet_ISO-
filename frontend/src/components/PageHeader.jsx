import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div className="page-header-action">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

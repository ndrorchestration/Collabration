'use client';

import { useState } from 'react';

const responseTypes = ['Support', 'Challenge', 'Qualify'];

export function ContextResponseBar() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="response-bar" aria-label="Contextual claim responses">
      {responseTypes.map((label) => <button type="button" key={label} className={selected === label ? 'response-button response-button--active' : 'response-button'} onClick={() => setSelected(selected === label ? null : label)}>{label}</button>)}
      <button type="button" className="response-button">Add evidence</button>
      <span className="demo-state">{selected ? `${selected} selected · demo only` : 'Demo interactions are not persisted'}</span>
    </div>
  );
}

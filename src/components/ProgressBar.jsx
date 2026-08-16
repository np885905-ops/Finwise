import React from 'react';

const ProgressBar = ({ percentage, colorClass }) => {
  const roundedPercent = Math.min(Math.max(Math.round(percentage || 0), 0), 100);

  // Dynamic color selection if not explicitly provided
  let barColor = colorClass;
  if (!barColor) {
    if (roundedPercent >= 90) {
      barColor = 'var(--color-danger)';
    } else if (roundedPercent >= 70) {
      barColor = 'var(--color-warning)';
    } else {
      barColor = 'var(--color-success)';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${roundedPercent}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

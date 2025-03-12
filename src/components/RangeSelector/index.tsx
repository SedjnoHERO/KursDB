import React, { useState } from 'react';

interface RangeSelectorProps {
  min: number;
  max: number;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({ min, max }) => {
  const [minValue, setMinValue] = useState<number>(min);
  const [maxValue, setMaxValue] = useState<number>(max);

  return (
    <div className="range-selector">
      <input
        type="number"
        className="range-input"
        value={minValue}
        onChange={e => setMinValue(Number(e.target.value))}
        placeholder="Min"
      />
      <span className="range-separator">-</span>
      <input
        type="number"
        className="range-input"
        value={maxValue}
        onChange={e => setMaxValue(Number(e.target.value))}
        placeholder="Max"
      />
    </div>
  );
};

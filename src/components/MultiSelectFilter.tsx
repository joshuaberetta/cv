import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectFilter.css';

interface MultiSelectFilterProps {
  id: string;
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  id,
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const clearAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="multi-select-container" ref={containerRef}>
      <label htmlFor={id} className="filter-label">{label}</label>
      <div className="multi-select-wrapper">
        <button
          type="button"
          id={id}
          className={`multi-select-trigger ${isOpen ? 'open' : ''} ${selectedValues.length > 0 ? 'has-selection' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="multi-select-text">{getDisplayText()}</span>
          <svg className="multi-select-arrow" width="12" height="12" viewBox="0 0 12 12">
            <path fill="currentColor" d="M6 9L1 4h10z" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="multi-select-dropdown">
            <div className="multi-select-header">
              <button
                type="button"
                className="multi-select-clear"
                onClick={clearAll}
                disabled={selectedValues.length === 0}
              >
                Clear All
              </button>
            </div>
            <div className="multi-select-options">
              {options.map(option => (
                <label key={option.value} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span className="multi-select-checkbox">
                    {selectedValues.includes(option.value) && (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="multi-select-label">
                    {option.label}
                    {option.count !== undefined && (
                      <span className="multi-select-count">({option.count})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectFilter;

import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function AutoSuggestDropdown({
  label,
  options = [],
  selectedOption,
  onChange,
  placeholder = 'Selecione...',
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (selectedOption?.label) {
      setInputValue(selectedOption.label);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (!inputValue) {
      setFilteredOptions([]);
      setShowOptions(false);
      return;
    }

    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowOptions(true);
  }, [inputValue, options]);

  const handleSelect = (option) => {
    setInputValue(option.label);
    onChange(option);
    setShowOptions(false);
  };

  const handleBlur = () => {
    // Envia o valor digitado mesmo se não for uma opção
    if (!selectedOption || selectedOption.label !== inputValue) {
      onChange({ label: inputValue, value: inputValue });
    }
    setTimeout(() => setShowOptions(false), 100);
  };

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FiSearch />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setShowOptions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
        />
        {showOptions && filteredOptions.length > 0 && (
          <ul className="absolute z-50 bg-white dark:bg-zinc-700 text-gray-800 dark:text-white mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md max-h-60 overflow-auto shadow-lg">
            {filteredOptions.map((option, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer"
                onMouseDown={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

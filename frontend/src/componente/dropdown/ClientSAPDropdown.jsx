import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL;

export default function ClientSAPDropdown({ value, onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (value && typeof value === 'object' && value.nome) {
      setInputValue(value.nome);
    } else if (typeof value === 'string') {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    const buscarClientes = async () => {
      try {
        const response = await axios.get(`${API}/sap/clients`, {
          params: { termo: inputValue }
        });
        console.log('Retorno da API /sap/clients:', response.data);

        const data = Array.isArray(response.data) ? response.data : [];

        // Mapeia para exibir nome + PN no dropdown.
        // label -> nome, value -> pn
        const formatado = data.map((c) => ({
          label: c.nome,
          value: c.pn
        }));

        setOptions(formatado);
        setShowOptions(true);
      } catch (err) {
        console.error('Erro ao buscar clientes SAP:', err);
        setOptions([]);
      }
    };

    const delay = setTimeout(buscarClientes, 400);
    return () => clearTimeout(delay);
  }, [inputValue]);

  const handleSelect = (option) => {
    setInputValue(option.label);
    onChange({ nome: option.label, pn: option.value });
    setShowOptions(false);
  };

  return (
    <div className="w-full relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Cliente SAP (Nome / PN)
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FiSearch />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => inputValue.length >= 2 && setShowOptions(true)}
          onBlur={() => setTimeout(() => setShowOptions(false), 100)}
          placeholder="Digite o nome do cliente"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
        />
        {showOptions && options.length > 0 && (
          <ul className="absolute z-50 bg-white dark:bg-zinc-700 text-gray-800 dark:text-white 
                         mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md 
                         max-h-60 overflow-auto shadow-lg">
            {options.map((option, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer"
                onMouseDown={() => handleSelect(option)}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  <span className="text-sm text-gray-500">{option.value}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

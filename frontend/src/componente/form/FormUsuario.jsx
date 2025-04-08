// FormUsuario.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormUsuario({ initialData = {}, onSubmit, onCancel }) {
    // Adicionando fallback para evitar acessar valores indefinidos
    const [nome, setNome] = useState(initialData?.nome || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [login, setLogin] = useState(initialData?.login || '');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [ativo, setAtivo] = useState(initialData?.ativo === 1); // Verifica se 'ativo' é 1
  
    useEffect(() => {
      if (initialData?.senha) {
        setSenha(''); // Clear senha field on edit, don't show hash
      }
    }, [initialData]);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ nome, email, login, senha, ativo });
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold mb-4">
          {initialData?.id ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Login</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
  
        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          {initialData?.id && (
            <div className="text-sm text-gray-500">
              A senha está protegida. Preencha abaixo para redefinir:
            </div>
          )}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-2 border rounded-md pr-10"
              placeholder={initialData?.id ? 'Nova senha (opcional)' : 'Digite a senha'}
              required={!initialData?.id && !senha} // Senha obrigatória apenas no cadastro
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-green-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
  
        {/* Campo Ativo/Desativado */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
          />
          <label className="text-sm text-gray-700">Ativo</label>
        </div>
  
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
          >
            Salvar
          </button>
        </div>
      </form>
    );
  }
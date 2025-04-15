import React, { useEffect, useRef, useState } from 'react';
import VanillaTilt from 'vanilla-tilt';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../componente/ParticlesBackground';
import axios from 'axios';
import { setAuthToken } from '../services/api';

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const tiltRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const loginInputRef = useRef(null);
  const senhaInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, {
        max: 5,
        speed: 700,
        glare: true,
        'max-glare': 0.15,
        scale: 1.00,
      });
    }

    const savedLogin = localStorage.getItem('rememberedLogin');
    if (savedLogin) {
      setLogin(savedLogin);
      setRememberMe(true);
      setTimeout(() => senhaInputRef.current?.focus(), 100);
    } else {
      setTimeout(() => loginInputRef.current?.focus(), 100);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    if (!login.trim()) {
      setErro('Informe seu login');
      loginInputRef.current?.focus();
      return;
    }

    if (!senha.trim()) {
      setErro('Informe sua senha');
      senhaInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API}/login`, { login, senha });

      if (rememberMe) {
        localStorage.setItem('rememberedLogin', login);
      } else {
        localStorage.removeItem('rememberedLogin');
      }

      const { token, tipo } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ tipo }));
      setAuthToken(token);

      setTimeout(() => {
        navigate(tipo === 'cliente' ? '/cliente/dashboard' : '/admin/dashboard');
      }, 300);

    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Credenciais inválidas. Verifique seu login e senha.';
      setErro(message);
      if (tiltRef.current) {
        tiltRef.current.classList.add('error-shake');
        setTimeout(() => tiltRef.current.classList.remove('error-shake'), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 200, 83, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        .login-container {
          animation: fadeIn 0.6s ease-out;
          box-shadow: 0 0 0 1px #10b981, 0 0 15px rgba(16, 185, 129, 0.2);
        }
        .input-focus:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }
        .input-error {
          border-color: #ef4444 !important;
          animation: shake 0.5s ease-in-out;
        }
        .error-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .button-hover:hover {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        .green-border {
          border: 1px solid #10b981;
        }
        .tooltip-box {
          border: 1px solid #10b981;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
        }
        .input-field {
          border: 1px solid #10b981;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
        }
        .captcha-box {
          border: 1px dashed #10b981;
        }
      `}</style>

      <ParticlesBackground />

      <div className="min-h-screen h-full flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div
          ref={tiltRef}
          className="login-container bg-zinc-900 bg-opacity-80 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10 rounded-2xl shadow-2xl w-full max-w-md sm:w-[90%] md:w-[80%] lg:w-[500px] backdrop-blur-sm border border-green-500 transition-all duration-300"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="bg-green-500 rounded-full p-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 tracking-wide text-white">
            Acesso <span className="text-green-400">IoT</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 text-center mb-6">
            Sistema de monitoramento industrial
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login" className="block mb-1 font-medium text-sm text-white flex items-center">
                Login
                {login && <span className="ml-auto text-xs text-green-400">Campo preenchido</span>}
              </label>
              <input
                id="login"
                ref={loginInputRef}
                type="text"
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  if (erro) setErro(null);
                }}
                placeholder="Digite seu login"
                className={`w-full px-4 py-3 rounded-md bg-black input-field transition-all duration-200 text-white placeholder-gray-500 focus:outline-none input-focus ${!login && erro ? 'input-error border-red-500' : ''}`}
              />
            </div>

            <div>
              <label htmlFor="senha" className="block mb-1 font-medium text-sm text-white flex items-center">
                Senha
                {senha && <span className="ml-auto text-xs text-green-400">Campo preenchido</span>}
              </label>
              <div className="relative">
                <input
                  id="senha"
                  ref={senhaInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    if (erro) setErro(null);
                  }}
                  placeholder="Digite sua senha"
                  className={`w-full px-4 py-3 pr-10 rounded-md bg-black input-field transition-all duration-200 text-white placeholder-gray-500 focus:outline-none input-focus ${!senha && erro ? 'input-error border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-green-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 rounded border-gray-600 text-green-500 focus:ring-green-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">Lembrar meu login</label>
            </div>

            {erro && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-md flex items-center text-sm">
                <AlertCircle size={16} className="mr-2" />
                <span>{erro}</span>
              </div>
            )}

            <div className="h-[60px] flex items-center justify-center captcha-box rounded-md text-gray-400 text-sm bg-black bg-opacity-50">
              <span>Google reCAPTCHA v2</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-green-600 to-green-500 text-black font-semibold rounded-md hover:from-green-500 hover:to-green-400 transition duration-300 disabled:opacity-70 button-hover flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span className="mr-1">Acessar Sistema</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative group inline-block">
              <span className="text-sm text-gray-400 cursor-pointer underline decoration-dotted">
                Precisa de ajuda?
              </span>
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-black tooltip-box text-gray-300 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 z-10">
                <strong className="text-green-400">Sistema de monitoramento IoT</strong><br />
                Em caso de problemas de acesso, contate o <strong>departamento comercial</strong> pelo telefone <span className="text-green-300">(11) 3456-7890</span> ou email <span className="text-green-300">suporte@alpina.com.br</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} ALPINA EQUIPAMENTOS INDUSTRIAIS
          </div>
        </div>
      </div>
    </div>
  );
}

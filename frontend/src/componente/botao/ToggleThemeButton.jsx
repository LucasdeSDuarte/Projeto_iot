import { useContext } from 'react';
import { ThemeContext } from "../../context/ThemeContext";
import { Moon, Sun } from 'lucide-react';

export default function ToggleThemeButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 text-white hover:text-green-400 transition"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      <span className="text-sm">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
    </button>
  );
}

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

function getInitialTheme(): boolean {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="flex w-full items-center hover:bg-muted/50 px-2 py-1.5 rounded-md text-sm gap-2"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  );
}

export default function ThemeInitScript() {
  // Inline script runs before React hydration to avoid theme flash.
  const code = `(() => {
  try {
    const key = 'fundi-theme';
    const stored = localStorage.getItem(key);
    const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = stored === 'light' || stored === 'dark' ? stored : (systemPrefersLight ? 'light' : 'dark');

    const root = document.documentElement;
    if (theme === 'light') root.classList.add('theme-light');
    else root.classList.remove('theme-light');
    root.dataset.theme = theme;
  } catch {
    // no-op
  }
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

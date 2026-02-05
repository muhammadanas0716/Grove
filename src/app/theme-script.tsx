export function ThemeScript() {
  const code = `(function(){try{const theme=localStorage.getItem('theme');const prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;const shouldBeLight=theme==='light'||(!theme&&!prefersDark);if(shouldBeLight){document.documentElement.classList.add('light');}}catch(e){}})();`;
  
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

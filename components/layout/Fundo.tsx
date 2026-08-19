/* SAMAÚMA — as fitas do ciclo em traço, atrás de tudo. Portado do `<div class="fundo">` estático do `index.html`. */

export function Fundo() {
  return (
    <div className="fundo" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fita1" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#e0a93a" /><stop offset=".5" stopColor="#8fbb3f" /><stop offset="1" stopColor="#2a6fa8" />
          </linearGradient>
          <linearGradient id="fita2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a8c7a" /><stop offset=".55" stopColor="#8fbb3f" /><stop offset="1" stopColor="#e0a93a" />
          </linearGradient>
        </defs>
        <path className="fita a" d="M-80 250 C 180 60, 300 420, 520 300 S 820 40, 1080 180 S 1400 120, 1520 -40" />
        <path className="fita b" d="M-60 780 C 220 700, 260 380, 520 470 S 900 720, 1180 560 S 1420 640, 1520 520" />
      </svg>
    </div>
  );
}

"use client";

export function TechBackground() {
  return (
    <div className="premium-tech-bg" aria-hidden="true">
      {/* Ambient Lighting Fields */}
      <div className="premium-tech-glow-teal" />
      <div className="premium-tech-glow-purple" />
      <div className="premium-tech-glow-amber" />

      {/* Grid patterns under mask */}
      <div className="premium-tech-mask">
        <div className="premium-tech-grid-secondary" />
        <div className="premium-tech-grid-primary" />

        {/* Subtle Electric Energy Flow SVG Layer */}
        <svg
          className="absolute inset-0 h-full w-full opacity-35 md:opacity-50 pointer-events-none select-none"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Defined glow filters for the glowing tips */}
          <defs>
            <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* -------------------------------------------------------- */}
          {/* Flow Path 1: Teal Cyber Corridor (Top Left to Bottom Right) */}
          {/* -------------------------------------------------------- */}
          {/* Static trace line */}
          <path
            d="M 128 0 L 128 256 L 448 256 L 448 640 L 832 640 L 832 1000"
            className="stroke-slate-200/5 dark:stroke-teal-500/5"
            strokeWidth="1"
          />
          {/* Glowing pulse backing */}
          <path
            d="M 128 0 L 128 256 L 448 256 L 448 640 L 832 640 L 832 1000"
            className="premium-tech-flow-line-1-glow"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.15"
          />
          {/* Active core flow segment */}
          <path
            d="M 128 0 L 128 256 L 448 256 L 448 640 L 832 640 L 832 1000"
            className="premium-tech-flow-line-1-core"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* -------------------------------------------------------- */}
          {/* Flow Path 2: Indigo Circuit Branch (Top Right to Bottom Left) */}
          {/* -------------------------------------------------------- */}
          {/* Static trace line */}
          <path
            d="M 896 0 L 896 320 L 576 320 L 576 768 L 192 768 L 192 1000"
            className="stroke-slate-200/5 dark:stroke-indigo-500/5"
            strokeWidth="1"
          />
          {/* Glowing pulse backing */}
          <path
            d="M 896 0 L 896 320 L 576 320 L 576 768 L 192 768 L 192 1000"
            className="premium-tech-flow-line-2-glow"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.12"
          />
          {/* Active core flow segment */}
          <path
            d="M 896 0 L 896 320 L 576 320 L 576 768 L 192 768 L 192 1000"
            className="premium-tech-flow-line-2-core"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* -------------------------------------------------------- */}
          {/* Flow Path 3: Amber Micro Grid Crossing (Horizontal Mid) */}
          {/* -------------------------------------------------------- */}
          {/* Static trace line */}
          <path
            d="M 0 448 L 384 448 L 384 576 L 704 576 L 704 384 L 1000 384"
            className="stroke-slate-200/5 dark:stroke-amber-500/5"
            strokeWidth="1"
          />
          {/* Glowing pulse backing */}
          <path
            d="M 0 448 L 384 448 L 384 576 L 704 576 L 704 384 L 1000 384"
            className="premium-tech-flow-line-3-glow"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.1"
          />
          {/* Active core flow segment */}
          <path
            d="M 0 448 L 384 448 L 384 576 L 704 576 L 704 384 L 1000 384"
            className="premium-tech-flow-line-3-core"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* -------------------------------------------------------- */}
          {/* Flow Path 4: Fast Teal Ascending Micro line */}
          {/* -------------------------------------------------------- */}
          {/* Static trace line */}
          <path
            d="M 320 1000 L 320 832 L 64 832 L 64 416 L 416 416 L 416 0"
            className="stroke-slate-200/5 dark:stroke-teal-500/5"
            strokeWidth="1"
          />
          {/* Glowing pulse backing */}
          <path
            d="M 320 1000 L 320 832 L 64 832 L 64 416 L 416 416 L 416 0"
            className="premium-tech-flow-line-4-glow"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.15"
          />
          {/* Active core flow segment */}
          <path
            d="M 320 1000 L 320 832 L 64 832 L 64 416 L 416 416 L 416 0"
            className="premium-tech-flow-line-4-core"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Structured horizontal tech grid line guides */}
      <div className="premium-tech-lines">
        <div className="premium-tech-line-h1" />
        <div className="premium-tech-line-h2" />
      </div>

      {/* Corner Vignette overlay */}
      <div className="premium-tech-vignette" />
    </div>
  );
}

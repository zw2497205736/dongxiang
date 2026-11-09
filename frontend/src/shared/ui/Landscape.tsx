export function Landscape({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? "landscape compact" : "landscape"}
      viewBox="0 0 600 420"
      aria-hidden="true"
    >
      <circle cx="440" cy="104" r="47" fill="#e9bd73" />
      <path d="M0 265 150 104 302 288 449 176 600 273V420H0Z" fill="#d9dbc6" />
      <path d="M0 332 182 195 360 340 492 259 600 316V420H0Z" fill="#9aaf8d" />
      <path
        d="M0 370C122 270 224 358 331 318S510 312 600 348V420H0Z"
        fill="#5d846b"
      />
      <path
        d="M0 412C142 348 226 407 349 368S505 363 600 384V420H0Z"
        fill="#315f4c"
      />
      <path
        d="M94 420C200 361 192 349 285 347S375 362 427 344"
        fill="none"
        stroke="#f1e6cb"
        strokeWidth="5"
      />
    </svg>
  );
}

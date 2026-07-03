export default function FamiliaIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 144 210"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Yadira, su familia y su perrita en la playa"
    >
      {/* Sky */}
      <rect width="144" height="210" fill="#E8F5FF" rx="12" />
      <rect width="144" height="118" fill="#87CEEB" rx="12" />

      {/* Sun */}
      <circle cx="20" cy="22" r="12" fill="#FFD700" />
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line
          key={i}
          x1={20 + Math.cos((deg * Math.PI) / 180) * 14}
          y1={22 + Math.sin((deg * Math.PI) / 180) * 14}
          x2={20 + Math.cos((deg * Math.PI) / 180) * 18}
          y2={22 + Math.sin((deg * Math.PI) / 180) * 18}
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      {/* Clouds */}
      <ellipse cx="90" cy="16" rx="18" ry="9" fill="white" opacity="0.85" />
      <ellipse cx="106" cy="13" rx="13" ry="8" fill="white" opacity="0.85" />
      <ellipse cx="120" cy="17" rx="10" ry="7" fill="white" opacity="0.85" />

      {/* Ocean */}
      <rect x="0" y="106" width="144" height="28" fill="#3E9AE4" />
      <path d="M0,110 Q12,106 24,110 T48,110 T72,110 T96,110 T120,110 T144,110 L144,134 L0,134Z" fill="#5BBBF5" opacity="0.6" />

      {/* Sand */}
      <rect x="0" y="128" width="144" height="82" fill="#F5DEB3" rx="0" />
      <rect x="0" y="128" width="144" height="5" fill="#E8C98A" />

      {/* === GRANDMA (left) === */}
      {/* Green dress */}
      <path d="M6,134 L12,97 L34,97 L40,134Z" fill="#5CB85C" />
      <rect x="12" y="100" width="22" height="8" fill="#4CAE4C" rx="2" />
      {/* Purse */}
      <rect x="4" y="112" width="10" height="8" fill="#8B4513" rx="2" />
      <path d="M4,112 Q9,108 14,112" stroke="#8B4513" strokeWidth="1.5" fill="none" />
      {/* Head */}
      <circle cx="23" cy="84" r="13" fill="#F0C8A0" />
      {/* Gray hair bun */}
      <ellipse cx="23" cy="74" rx="11" ry="8" fill="#B0B0B0" />
      <circle cx="23" cy="68" r="7" fill="#B0B0B0" />
      <ellipse cx="23" cy="66" rx="5" ry="4" fill="#C8C8C8" />
      {/* Glasses */}
      <circle cx="19" cy="84" r="4" fill="none" stroke="#555" strokeWidth="1.5" />
      <circle cx="27" cy="84" r="4" fill="none" stroke="#555" strokeWidth="1.5" />
      <line x1="23" y1="84" x2="23" y2="84" stroke="#555" strokeWidth="1.5" />
      <line x1="15" y1="83" x2="13" y2="81" stroke="#555" strokeWidth="1.5" />
      <line x1="31" y1="83" x2="33" y2="81" stroke="#555" strokeWidth="1.5" />
      {/* Eyes behind glasses */}
      <circle cx="19" cy="84" r="2" fill="#5C3D2E" />
      <circle cx="27" cy="84" r="2" fill="#5C3D2E" />
      {/* Smile */}
      <path d="M19,89 Q23,93 27,89" stroke="#C07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="15" cy="88" r="3" fill="#FFB6C1" opacity="0.5" />
      <circle cx="31" cy="88" r="3" fill="#FFB6C1" opacity="0.5" />

      {/* === YADIRA (center, front) === */}
      {/* White top */}
      <path d="M56,134 L61,96 L89,96 L94,134Z" fill="white" stroke="#E0E0E0" strokeWidth="0.5" />
      <rect x="61" y="99" width="28" height="9" fill="#F8F8F8" rx="2" />
      {/* Head (warm skin, cubana) */}
      <circle cx="75" cy="80" r="16" fill="#C68642" />
      {/* Dark wavy hair */}
      <path d="M59,78 Q60,62 75,62 Q90,62 91,78 Q88,68 75,68 Q62,68 59,78Z" fill="#1A1A1A" />
      <ellipse cx="75" cy="65" rx="14" ry="8" fill="#1A1A1A" />
      {/* Hair sides */}
      <ellipse cx="59" cy="80" rx="4" ry="8" fill="#1A1A1A" />
      <ellipse cx="91" cy="80" rx="4" ry="8" fill="#1A1A1A" />
      {/* Cat-eye glasses */}
      <path d="M63,80 L69,77 L74,79 L69,82Z" fill="none" stroke="#333" strokeWidth="1.5" />
      <path d="M76,79 L81,77 L87,80 L81,82Z" fill="none" stroke="#333" strokeWidth="1.5" />
      <line x1="74" y1="79" x2="76" y2="79" stroke="#333" strokeWidth="1.5" />
      <line x1="63" y1="80" x2="61" y2="78" stroke="#333" strokeWidth="1.5" />
      <line x1="87" y1="80" x2="89" y2="78" stroke="#333" strokeWidth="1.5" />
      {/* Eyes */}
      <ellipse cx="69" cy="80" rx="3" ry="2.5" fill="#3D1F0D" />
      <ellipse cx="81" cy="79" rx="3" ry="2.5" fill="#3D1F0D" />
      <circle cx="70" cy="79" r="1" fill="white" />
      <circle cx="82" cy="78" r="1" fill="white" />
      {/* Big smile */}
      <path d="M68,87 Q75,94 82,87" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="63" cy="88" r="4" fill="#FFB6C1" opacity="0.4" />
      <circle cx="87" cy="88" r="4" fill="#FFB6C1" opacity="0.4" />

      {/* === GRANDPA (right) === */}
      {/* Red polo shirt */}
      <path d="M104,134 L110,97 L132,97 L138,134Z" fill="#D9534F" />
      <rect x="110" y="100" width="22" height="8" fill="#C9433F" rx="2" />
      {/* Blue shorts peeking */}
      <rect x="110" y="126" width="22" height="10" fill="#4A6FA5" rx="2" />
      {/* Head */}
      <circle cx="121" cy="84" r="13" fill="#F0C8A0" />
      {/* Baseball cap (AllGo blue) */}
      <ellipse cx="121" cy="74" rx="13" ry="6" fill="#3E9AE4" />
      <rect x="108" y="72" width="26" height="6" fill="#3E9AE4" rx="1" />
      <path d="M108,76 L103,77 L107,79 L108,78Z" fill="#3E9AE4" />
      {/* White hair sides */}
      <ellipse cx="108" cy="80" rx="4" ry="6" fill="#E8E8E8" />
      <ellipse cx="134" cy="80" rx="4" ry="6" fill="#E8E8E8" />
      {/* Glasses */}
      <circle cx="117" cy="85" r="4" fill="none" stroke="#555" strokeWidth="1.5" />
      <circle cx="125" cy="85" r="4" fill="none" stroke="#555" strokeWidth="1.5" />
      <line x1="121" y1="85" x2="121" y2="85" stroke="#555" strokeWidth="1.5" />
      <line x1="113" y1="84" x2="111" y2="82" stroke="#555" strokeWidth="1.5" />
      <line x1="129" y1="84" x2="131" y2="82" stroke="#555" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="117" cy="85" r="2" fill="#3D2B1F" />
      <circle cx="125" cy="85" r="2" fill="#3D2B1F" />
      {/* Smile */}
      <path d="M117,90 Q121,94 125,90" stroke="#C07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="111" cy="90" r="3" fill="#FFB6C1" opacity="0.4" />
      <circle cx="131" cy="90" r="3" fill="#FFB6C1" opacity="0.4" />

      {/* === FRENCH BULLDOG (front center) === */}
      {/* Pink leash */}
      <path d="M75,184 Q78,195 85,200" stroke="#FF8FAB" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="72" cy="178" rx="20" ry="14" fill="#7A6248" />
      {/* Red harness */}
      <ellipse cx="72" cy="174" rx="20" ry="11" fill="none" stroke="#D9534F" strokeWidth="3" />
      <line x1="72" y1="163" x2="72" y2="185" stroke="#D9534F" strokeWidth="3" />
      <line x1="52" y1="174" x2="92" y2="174" stroke="#D9534F" strokeWidth="2" />
      {/* Head */}
      <circle cx="72" cy="158" r="17" fill="#7A6248" />
      {/* Bat ears */}
      <path d="M55,150 L49,134 L65,145Z" fill="#7A6248" />
      <path d="M89,150 L95,134 L79,145Z" fill="#7A6248" />
      {/* Inner ears (pink) */}
      <path d="M57,149 L52,137 L63,145Z" fill="#DFA0A0" opacity="0.7" />
      <path d="M87,149 L92,137 L81,145Z" fill="#DFA0A0" opacity="0.7" />
      {/* Eye patches (dark) */}
      <ellipse cx="64" cy="155" rx="8" ry="7" fill="#3D2B1F" opacity="0.6" />
      <ellipse cx="80" cy="155" rx="8" ry="7" fill="#3D2B1F" opacity="0.6" />
      {/* Eyes */}
      <circle cx="64" cy="155" r="5" fill="#1A1A1A" />
      <circle cx="80" cy="155" r="5" fill="#1A1A1A" />
      <circle cx="66" cy="153" r="2" fill="white" />
      <circle cx="82" cy="153" r="2" fill="white" />
      <circle cx="67" cy="153" r="1" fill="#1A1A1A" />
      <circle cx="83" cy="153" r="1" fill="#1A1A1A" />
      {/* Big flat nose */}
      <ellipse cx="72" cy="163" rx="8" ry="5" fill="#2D1F0D" />
      <ellipse cx="69" cy="162" rx="3" ry="2.5" fill="#3D2B1F" />
      <ellipse cx="75" cy="162" rx="3" ry="2.5" fill="#3D2B1F" />
      <line x1="72" y1="163" x2="72" y2="167" stroke="#2D1F0D" strokeWidth="1.5" />
      {/* Tongue */}
      <path d="M67,167 Q72,175 77,167" fill="#E8A0A0" />
      <path d="M69,171 Q72,175 75,171 Q75,174 72,176 Q69,174 69,171Z" fill="#DFA0A0" />
      {/* Wrinkle lines */}
      <path d="M64,152 Q60,150 58,152" stroke="#5C3D2E" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M80,152 Q84,150 86,152" stroke="#5C3D2E" strokeWidth="1" fill="none" opacity="0.4" />

      {/* AllGo blue border frame */}
      <rect width="144" height="210" fill="none" stroke="#3E9AE4" strokeWidth="3" rx="12" />

      {/* Watermark */}
      <text x="72" y="206" textAnchor="middle" fontSize="6.5" fill="#3E9AE4" fontFamily="sans-serif" fontWeight="bold">✈ AllGo Travel</text>
    </svg>
  )
}

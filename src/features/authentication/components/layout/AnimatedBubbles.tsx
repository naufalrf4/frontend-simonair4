export default function AnimatedBubbles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          100% { transform: translateY(-110vh) scale(1.2); opacity: 0; }
        }
        .bubble { animation: float-up 15s linear infinite; }
        .bubble2 { animation-duration: 19s; animation-delay: 2s; }
        .bubble3 { animation-duration: 13s; animation-delay: 4s; }
        .bubble4 { animation-duration: 22s; animation-delay: 1.5s; }
        .bubble5 { animation-duration: 16s; animation-delay: 5s; }
      `}</style>
      <svg className="absolute left-[5%] bottom-[-60px] w-24 h-24 bubble" viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="40" ry="28" fill="#38bdf8" fillOpacity="0.19" />
      </svg>
      <svg className="absolute left-[25%] bottom-[-100px] w-32 h-28 bubble bubble2" viewBox="0 0 110 110">
        <ellipse cx="55" cy="55" rx="44" ry="32" fill="#06b6d4" fillOpacity="0.16" />
      </svg>
      <svg className="absolute left-[60%] bottom-[-80px] w-28 h-20 bubble bubble3" viewBox="0 0 110 80">
        <ellipse cx="55" cy="40" rx="34" ry="24" fill="#2563eb" fillOpacity="0.14" />
      </svg>
      <svg className="absolute left-[45%] bottom-[-120px] w-40 h-36 bubble bubble4" viewBox="0 0 180 130">
        <ellipse cx="90" cy="65" rx="60" ry="44" fill="#2dd4bf" fillOpacity="0.14" />
      </svg>
      <svg className="absolute left-[80%] bottom-[-60px] w-20 h-14 bubble bubble5" viewBox="0 0 70 40">
        <ellipse cx="35" cy="20" rx="30" ry="18" fill="#1e293b" fillOpacity="0.08" />
      </svg>
    </div>
  );
}

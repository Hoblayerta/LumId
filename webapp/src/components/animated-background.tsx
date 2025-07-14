"use client"

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video background with purple filter - optimized for mobile */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-15 md:opacity-20"
          style={{
            filter: "hue-rotate(240deg) saturate(1.5) brightness(0.7) contrast(1.2)",
          }}
        >
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250713_2136_video-ogSkG44O5vyQ1Oyl1NiXoMoUUQ6REx.mp4"
            type="video/mp4"
          />
        </video>

        {/* Purple overlay to enhance the purple effect */}
        <div className="absolute inset-0 bg-purple-900/40 md:bg-purple-900/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 via-violet-900/40 to-purple-900/50 md:from-purple-800/20 md:via-violet-900/30 md:to-purple-900/40" />
      </div>

      {/* Additional animated orbs - smaller on mobile */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-500/8 md:bg-purple-500/10 rounded-full blur-2xl md:blur-3xl animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-cyan-500/6 md:bg-cyan-500/8 rounded-full blur-2xl md:blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 md:w-80 md:h-80 bg-purple-600/6 md:bg-purple-600/8 rounded-full blur-2xl md:blur-3xl animate-pulse delay-2000" />

      {/* Floating particles - adjusted for mobile */}
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400/30 md:bg-cyan-400/40 rounded-full animate-ping delay-500" />
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/50 md:bg-purple-400/60 rounded-full animate-ping delay-1500" />
      <div className="absolute bottom-1/3 left-1/4 w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-300/40 md:bg-cyan-300/50 rounded-full animate-ping delay-3000" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-3 md:opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, #8b5cf6 1px, transparent 1px)`,
          backgroundSize: "30px 30px md:50px 50px",
        }}
      />
    </div>
  )
}

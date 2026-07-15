import React from "react";

/**
 * Ambient page atmosphere for Kineo — "Night Turf" scheme.
 * A near-black green-cast ground, a faint dotted grid that fades toward the
 * edges, and two slow-drifting glows (lime + blue) that give the page depth
 * without competing with content. All colours are theme tokens, so this same
 * component reads correctly in the light theme too.
 */
const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-paper">
      {/* Faint dotted grid, masked to fade out toward the edges */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-line-strong) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(120% 90% at 50% 0%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 0%, black 35%, transparent 100%)",
        }}
      />

      {/* Soft top light so the hero sits in a pool of glow */}
      <div
        className="absolute inset-x-0 top-0 h-[80vh]"
        style={{
          background:
            "radial-gradient(55% 50% at 50% -5%, rgba(201,242,77,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Drifting glows — lime near the hero copy, blue near the showcase cards */}
      <div className="animate-drift absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full bg-lime/10 blur-3xl" />
      <div
        className="animate-drift absolute -top-10 right-[-6%] h-[460px] w-[460px] rounded-full bg-blue/15 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="animate-drift absolute bottom-[-14%] left-[22%] h-[420px] w-[420px] rounded-full bg-lime/[0.07] blur-3xl"
        style={{ animationDelay: "-11s" }}
      />
    </div>
  );
};

export default Background;

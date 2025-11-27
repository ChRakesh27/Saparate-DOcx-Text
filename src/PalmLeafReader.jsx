export default function PalmLeafReader({ pairs }) {
  return (
    <div className="w-full h-screen bg-[#050508] flex items-center justify-center ">
      {/* Safe area container for mobile landscape */}
      <div className="relative w-full max-w-[900px] h-[70vh] md:h-[80vh] px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 text-[11px] text-amber-50/90 uppercase tracking-[0.18em]">
          <span className="flex items-center gap-1">
            <span className="h-[6px] w-[6px] rounded-full bg-emerald-400/80" />
            Diamond Sutra · Palm Leaf
          </span>
          <span className="opacity-70">Scroll ↓ verse by verse</span>
        </div>

        {/* Vertical scroll area */}
        <div
          className="
            relative
            h-full
            overflow-y-auto
            overflow-x-hidden
            snap-y snap-mandatory
            flex flex-col
            gap-4
            pb-4
            [-webkit-overflow-scrolling:touch]
          "
        >
          {pairs.map((verse, index) => (
            <section
              key={index}
              className="snap-start flex-shrink-0 h-full flex items-center justify-center py-2"
            >
              {/* Palm-leaf card */}
              <article
                className="
                  relative
                  w-full
                  max-w-[880px]
                  h-[65vh]
                  md:h-[70vh]
                  mx-auto
                  rounded-2xl
                  border border-[#ddc9a0]/80
                  bg-[radial-gradient(circle_at_top,#fbf3df_0%,#f1e0b9_40%,#e3c894_80%)]
                  shadow-[0_20px_60px_rgba(0,0,0,0.55)]
                  text-[#3b270e]
                  px-6 py-5
                  md:px-9 md:py-6
                  flex flex-col
                "
              >
                {/* Subtle vertical grain */}
                <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_0,transparent_1px)] bg-[length:3px_100%]" />
                </div>

                {/* Header */}
                <header className="relative z-10 mb-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[11px] tracking-[0.22em] uppercase text-[#7e5a26]/80">
                      Vajrachedika Prajñāpāramita
                    </p>
                    <h2 className="text-sm md:text-base font-semibold tracking-wide text-[#3b210b]">
                      Verse {String(index + 1).padStart(2, "0")}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end text-[11px] text-[#7e5a26]/90">
                    <span className="px-2 py-1 rounded-full border border-[#c49b62]/60 bg-[#f7e2b6]/80">
                      Pair {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </header>

                {/* Divider */}
                <div className="relative z-10 mb-3 flex items-center gap-2">
                  <span className="h-[1px] flex-1 bg-gradient-to-r from-[#98652a]/60 via-[#c99d5c]/80 to-transparent" />
                  <span className="h-[7px] w-[7px] rounded-full bg-[#c99d5c]/80" />
                  <span className="h-[1px] flex-1 bg-gradient-to-l from-[#98652a]/60 via-[#c99d5c]/80 to-transparent" />
                </div>

                {/* Verse body: Hindi + English */}
                <main className="relative z-10 flex-1 overflow-y-auto text-[13px] leading-relaxed md:text-[14px] md:leading-relaxed pr-1 space-y-4">
                  {/* Hindi block */}
                  {verse.hindi && (
                    <div
                      className="text-center md:text-left font-medium"
                      dangerouslySetInnerHTML={{ __html: verse.hindi }}
                    />
                  )}

                  {/* Subtle separator between langs */}
                  {verse.hindi && verse.english && (
                    <div className="flex justify-center my-1">
                      <span className="h-px w-12 bg-[#b27b36]/50" />
                    </div>
                  )}

                  {/* English block */}
                  {verse.english && (
                    <div
                      className="text-center md:text-left italic text-[#3b270e]"
                      dangerouslySetInnerHTML={{ __html: verse.english }}
                    />
                  )}
                </main>

                {/* Bottom meta row */}
                <footer className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-[#7e5a26]/80">
                  <span>
                    {index < pairs.length - 1
                      ? "Scroll down for next verse ↓"
                      : "End of this chapter"}
                  </span>
                  <span>Diamond Sutra · Palm Leaf Reader</span>
                </footer>
              </article>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

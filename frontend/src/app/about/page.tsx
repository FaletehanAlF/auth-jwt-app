import Link from "next/link";
import SiteMenu from "../../components/SiteMenu";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <div className="relative w-full max-w-full overflow-x-clip overscroll-none">
        {}
        <SiteMenu />

        <main className="w-full max-w-full overflow-x-clip overscroll-none">
          {}
          <section className="relative flex min-h-[70svh] w-full max-w-full overflow-hidden">
            {}
            <div aria-hidden="true" className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-neutral-950/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-blue-950/40 to-neutral-950" />
            </div>

            <div className="relative m-auto w-full max-w-5xl px-4 py-28 text-center sm:px-6 sm:py-36">
              <h1 className="mx-auto max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
                About Us
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                JobTrack helps you bring job applications, interviews, and
                career progress into one place — beautifully and effortlessly.
              </p>
              <Link
                href="/profile"
                className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                Go to Profile
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>

          {}
          <div className="relative w-full max-w-full bg-gradient-to-b from-neutral-950 via-blue-950 to-neutral-950">
            <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
              <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Why JobTrack exists
              </h2>
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { title: "Simple", desc: "One place for every opportunity you pursue." },
                  { title: "Focused", desc: "Know exactly what stage each application is in." },
                  { title: "Yours", desc: "Your career journey, organized your way." },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                    <h3 className="font-display text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

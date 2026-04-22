"use client";

import Link from "next/link";
import { useEffect } from "react";
import CreatorCarousel, { type CreatorVideo } from "@/components/CreatorCarousel";

const creators: CreatorVideo[] = [
  {
    name: "katjaUGC",
    niche: "Home & Family",
    src: "/videos/Katja1.mp4",
    poster: "/images/katja1.jpg",
  },
  {
    name: "KatjaUGC",
    niche: "Beauty & Skincare",
    src: "/videos/Katja2.mp4",
    poster: "/images/katja2.jpg",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Briefing & goals",
    text: "Brands submit a structured briefing with goals, niche, deliverables, timeline and licensing requirements from the very beginning.",
  },
  {
    step: "02",
    title: "Internal review & creator matching",
    text: "Our team reviews every request, sharpens the workflow where needed and matches the campaign with suitable verified creators.",
  },
  {
    step: "03",
    title: "Content production & revisions",
    text: "Creators produce content based on the briefing. If adjustments are needed, revisions can be requested in a clear and organized way.",
  },
  {
    step: "04",
    title: "Final approval & delivery",
    text: "After internal checks and brand confirmation, the content is finalized, approved and delivered with a transparent approval structure.",
  },
];

export default function PublicPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F1EA] text-gray-900">
      <section id="home" className="px-6 pb-24 pt-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="reveal-section">
              <h1 className="font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl">
                Perfect matches
                <br />
                between brands
                <br />& creators
              </h1>

              <p className="mt-6 max-w-xl text-sm text-gray-600 md:text-base">
                A premium UGC matchmaking platform — transparent, efficient, and fair for both
                sides.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register/brand"
                  className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  For brands
                </Link>
                <Link
                  href="/register/creator"
                  className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  For creators
                </Link>
              </div>

              <div className="mt-16">
                <div className="text-[11px] font-semibold tracking-[0.25em] text-gray-500">
                  TRUSTED WORKFLOW
                </div>

                <div className="mt-10 max-w-4xl font-serif text-4xl leading-[1.1] text-gray-900 md:text-5xl">
                  We build trusted collaborations between premium brands and high-performing
                  creators.
                </div>

                <div className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-700">
                  Through curated selection, structured workflows and transparent licensing,
                  Prime Content ensures reliable partnerships that are efficient, scalable and
                  built for long-term success — for brands and creators alike.
                </div>
              </div>
            </div>

            <div className="reveal-section rounded-3xl border bg-white/60 p-6 shadow-sm">
              <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-600">
                CREATOR OF THE MONTH
              </div>

              <div className="mt-4">
                <CreatorCarousel items={creators} intervalMs={9000} />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Curated matchmaking</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    We pre-qualify creators to match style, niche and performance goals.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Clear licensing</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Transparent license terms that stay consistent across the workflow.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Double review process</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    We review workflows internally before final brand approval happens.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Personal support</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Fast communication, revision handling and direct support throughout the whole process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section id="how-it-works" className="mt-24 reveal-section">
            <div className="rounded-3xl border bg-white/60 p-10">
              <div className="max-w-3xl">
                <div className="text-[11px] font-semibold tracking-[0.25em] text-gray-500">
                  HOW IT WORKS
                </div>
                <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
                  A clear process for premium collaborations
                </h2>
                <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
                  We do not just connect brands and creators. We structure the whole collaboration,
                  review every important step and stay reachable whenever changes, questions or
                  approvals are needed.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {howItWorks.map((item) => (
                  <div key={item.step} className="rounded-2xl border bg-white/75 p-6">
                    <div className="text-xs font-semibold tracking-[0.2em] text-gray-500">
                      STEP {item.step}
                    </div>
                    <div className="mt-3 text-lg font-semibold text-gray-900">{item.title}</div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Quality before speed</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    We prefer clear workflows and strong creator matches over rushed campaign handling.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Changes stay manageable</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Revision requests are documented and structured so nobody loses track during production.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Always reachable</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Brands and creators can rely on direct support during briefing, production and approval.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="brands" className="mt-24 reveal-section">
            <div className="rounded-3xl border bg-white/60 p-10">
              <h2 className="font-serif text-4xl tracking-tight">For Brands</h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
                Create structured briefings, receive staff-reviewed workflows and get matched with
                creators that fit your campaign goals. No messy outreach — just premium execution.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Create a briefing</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Define niche, deliverables, timeline and licensing from the start.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Internal review</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    We help make every briefing clear, usable and production-ready before it moves forward.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Reliable delivery</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Prime Content keeps the workflow structured from briefing to final approval.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register/brand"
                  className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  Create brand account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </Link>
              </div>
            </div>
          </section>

          <section id="creators" className="mt-24 reveal-section">
            <div className="rounded-3xl border bg-white/60 p-10">
              <h2 className="font-serif text-4xl tracking-tight">For Creators</h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
                Get matched to brand opportunities that fit your style and niche. Upload your intro
                video and profile once, then work through a clean approval flow.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Curated opportunities</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    No cold outreach needed — campaigns come through the platform.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Clear production flow</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Upload content, receive change requests and track approvals clearly.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">Fair structure</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Know the requirements, licensing and workflow before production starts.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register/creator"
                  className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  Create creator account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </Link>
              </div>
            </div>
          </section>

          <section id="about" className="mt-24 reveal-section">
            <div className="rounded-3xl border bg-white/60 p-10">
              <div className="max-w-4xl">
                <div className="text-[11px] font-semibold tracking-[0.25em] text-gray-500">
                  ABOUT US
                </div>

                <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
                  We are not a traditional marketing agency.
                </h2>

                <div className="mt-6 space-y-5 text-sm leading-7 text-gray-700 md:text-base">
                  <p>
                    We are the connection between brands and real people.
                  </p>

                  <p>
                    In a world full of advertising that gets ignored, we build content that does
                    not feel like advertising. Content that makes people stop. Content that builds
                    trust. And content that sells.
                  </p>

                  <p>
                    Why?
                  </p>

                  <p>
                    Because people are not convinced by perfect polished visuals alone. They are
                    convinced by real experiences, real emotions and real stories.
                  </p>

                  <p>
                    That is exactly where we come in.
                  </p>

                  <p>
                    We work with creators who know how to win attention in the first three seconds.
                    We develop content that not only looks good, but is also psychologically built
                    for performance:
                  </p>

                  <ul className="space-y-2 pl-5 text-gray-700">
                    <li>• based on behavior, not assumptions</li>
                    <li>• optimized for platforms, not for egos</li>
                    <li>• made for results, not for likes</li>
                  </ul>

                  <p>
                    Our focus is simple:
                    <br />
                    More trust. More attention. More revenue.
                  </p>

                  <p>
                    We do not think in campaigns — we think in impact.
                  </p>

                  <p>
                    Every brand has a story.
                    <br />
                    Our job is to tell it in a way that makes people stop scrolling and start acting.
                  </p>

                  <p className="font-semibold text-gray-900">
                    If you want content that does not just exist, but performs — you are in the
                    right place.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-24 reveal-section">
            <div className="rounded-3xl border bg-gray-900 px-8 py-12 text-white md:px-12">
              <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.25em] text-white/60">
                    READY TO START?
                  </div>
                  <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
                    Let’s build creator campaigns that actually perform.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                    Structured workflows, strong creator matching and premium support from first
                    briefing to final approval.
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <Link
                    href="/register/brand"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:opacity-90"
                  >
                    Start as brand
                  </Link>
                  <Link
                    href="/register/creator"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Start as creator
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
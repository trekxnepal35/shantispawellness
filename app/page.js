
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RichTextContent from "./components/RichTextContent";

export default function HomePage() {
  const [spaPages, setSpaPages] = useState([]);
  const [wellnessPages, setWellnessPages] = useState([]);
  const [faqPage, setFaqPage] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [wellnessResponse, spaResponse, faqResponse, feedbackResponse,] =
          await Promise.all([
            fetch("/api/pages?published=true&pageType=wellness&limit=100", {
              cache: "no-store",
            }),
            fetch("/api/pages?published=true&pageType=spa&limit=100", {
              cache: "no-store",
            }),
            fetch("/api/faq", {
              cache: "no-store",
            }),
            fetch("/api/feedback?page=1&limit=100", {
              cache: "no-store",
            }),
          ]);

        const [wellnessResult, spaResult, faqResult, feedbackResult,] =
          await Promise.all([
            wellnessResponse.json(),
            spaResponse.json(),
            faqResponse.json(),
            feedbackResponse.json(),
          ]);



        if (!active) return;

        if (wellnessResult.success) {
          const pages = Array.isArray(wellnessResult.data)
            ? wellnessResult.data
            : [];

          pages.sort((a, b) => {
            const orderA = Number.isFinite(Number(a.order))
              ? Number(a.order)
              : Number.MAX_SAFE_INTEGER;

            const orderB = Number.isFinite(Number(b.order))
              ? Number(b.order)
              : Number.MAX_SAFE_INTEGER;

            return orderA - orderB;
          });

          setWellnessPages(pages);
        } else {
          setError("Unable to load wellness experiences.");
        }

        if (spaResult.success) {
          const pages = Array.isArray(spaResult.data)
            ? spaResult.data
            : [];

          pages.sort((a, b) => {
            const orderA = Number.isFinite(Number(a.order))
              ? Number(a.order)
              : Number.MAX_SAFE_INTEGER;

            const orderB = Number.isFinite(Number(b.order))
              ? Number(b.order)
              : Number.MAX_SAFE_INTEGER;

            return orderA - orderB;
          });

          setSpaPages(pages);
        }

        if (faqResult.success) {
          setFaqPage(faqResult.data || null);
        }
        if (feedbackResult.success) {
          const reviews = Array.isArray(feedbackResult.data)
            ? feedbackResult.data
            : [];

          const spaAndWellnessReviews = reviews.filter((review) => {
            const pageTypeSlug = review.page?.pageType?.slug;

            return (
              pageTypeSlug === "spa" ||
              pageTypeSlug === "wellness"
            );
          });

          setFeedback(spaAndWellnessReviews.slice(0, 6));
        }
      } catch (err) {
        console.error("Homepage loading error:", err);

        if (active) {
          setError("Unable to load some website content.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  function getPrice(item) {
    const price = item?.price;

    if (!price) return null;

    if (price.pricingType === "pax_based") {
      const prices = Array.isArray(price.paxPrices)
        ? price.paxPrices
          .map((tier) => Number(tier.pricePerPax))
          .filter((amount) => Number.isFinite(amount) && amount > 0)
        : [];

      if (!prices.length) return null;

      return {
        amount: Math.min(...prices),
        currency: price.currency || "USD",
      };
    }

    const amount = Number(price.amount);

    if (!Number.isFinite(amount) || amount <= 0) return null;

    return {
      amount,
      currency: price.currency || "USD",
    };
  }

  function getImage(item) {
    const image = item?.cardImageUrl ||
      item?.imageUrl ||
      item?.image;

    if (typeof image === "string") return image;
    if (image && typeof image === "object") return image.url || "";

    return "";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f3]">
        <section className="min-h-[650px] animate-pulse bg-[#203b32]" />
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="h-10 w-72 rounded bg-stone-200" />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-96 rounded-3xl bg-stone-200"
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  /*
  
  # POPULAR EXPERIENCES
  
  */

  const popularExperiences = [


    ...spaPages.map(
      (item) => ({
        ...item,
        experienceType: "spa",
      })
    ),

    ...wellnessPages.map(
      (item) => ({
        ...item,
        experienceType: "wellness",
      })
    ),


  ]
    .sort(
      (a, b) => {


        const orderA =
          Number.isFinite(
            Number(a.order)
          )
            ? Number(a.order)
            : Number.MAX_SAFE_INTEGER;


        const orderB =
          Number.isFinite(
            Number(b.order)
          )
            ? Number(b.order)
            : Number.MAX_SAFE_INTEGER;


        return orderA - orderB;

      }
    )
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26382f]">

      {/* HERO */}
      <section className="relative flex min-h-[430px] items-center overflow-hidden bg-[#203b32]">


        {/* Hero background image */}
        <img
          src="/images/shanti-spa-hero.jpg"
          alt="Luxury Shanti spa and wellness sanctuary"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#142c24]/95 via-[#203b32]/80 to-[#203b32]/30" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(210,185,135,0.20),transparent_40%)]" />
        <section className="mx-auto max-w-full px-6 py-20 lg:px-8">
          <div className="relative mx-auto w-full max-w-full px-6 py-28 lg:px-8 grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* <div className="relative mx-auto w-full max-w-7xl px-6 py-28 lg:px-8"> */}
            <div className="max-w-3xl text-white">

              <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#d9c49b]">
                <span className="h-px w-10 bg-[#d9c49b] " />
                Shanti Spa & Wellness
              </span>

              <h1 className="mt-8 text-5xl font-light leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                Find Your
                <span className="block font-semibold italic text-[#dfcba7]">
                  Inner Balance
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-9 text-white/80 sm:text-xl">
                Step away from the everyday and rediscover a sense of calm.
                Experience thoughtful therapies, restorative rituals and
                personalised wellness in a peaceful sanctuary.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/spa"
                  className="rounded-full bg-[#d8c29a] px-8 py-4 text-center text-sm font-bold uppercase tracking-wider text-[#26382f] transition hover:bg-white"
                >
                  Explore Spa
                </Link>

                <Link
                  href="/wellness"
                  className="rounded-full border border-white/50 px-8 py-4 text-center text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-[#26382f]"
                >
                  Explore Wellness
                </Link>
              </div>

              <div className="mt-16 flex flex-wrap gap-8 border-t border-white/20 pt-8 text-sm text-white/70">
                <span>✦ Personalised Wellness</span>
                <span>✦ Restorative Therapies</span>
                <span>✦ Moments of Stillness</span>
              </div>
            </div>



            {/* ==================================
                Right SIDE
              ================================== */}

            {/* =====================================
                POPULAR EXPERIENCES
              ===================================== */}
            <div className="relative">
              {popularExperiences.length > 0 && (


                <PopularExperiences
                  experiences={
                    popularExperiences
                  }
                  getPrice={
                    getPrice
                  }
                />

              )}
            </div>
          </div>
        </section>
      </section>

      {/* INTRODUCTION */}
      <section
        id="our-philosophy"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a58a5e]">
              The Shanti Philosophy
            </p>

            <h2 className="mt-5 text-4xl font-light leading-tight text-[#26382f] sm:text-5xl">
              A sanctuary for
              <span className="block font-semibold italic">
                body, mind and soul.
              </span>
            </h2>
          </div>

          <div>
            <p className="text-lg leading-9 text-stone-600">
              At Shanti, wellness is more than a treatment. It is time
              dedicated to yourself — a chance to slow down, reconnect
              and restore your natural sense of balance.
            </p>

            <p className="mt-5 leading-8 text-stone-600">
              Our experiences are designed around relaxation, mindful
              care and personal wellbeing. Discover a peaceful space
              where every visit becomes an opportunity to feel renewed.
            </p>

            <Link
              href="#experiences"
              className="mt-8 inline-flex items-center gap-3 border-b border-[#a58a5e] pb-2 text-sm font-bold uppercase tracking-wider text-[#786342] transition hover:text-[#26382f]"
            >
              Discover our experiences <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WELLNESS EXPERIENCES */}
      <section
        id="experiences"
        className="bg-[#f0ede5] px-6 py-24 lg:px-8"
      >
        <div className="mx-auto max-w-full">

          <SectionHeading
            eyebrow="Explore Shanti"
            title="Wellness Experiences"
            description="Explore our collection of restorative treatments and wellness experiences, thoughtfully designed to help you relax, recharge and reconnect."
          />

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {wellnessPages.length > 0 ? (
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {wellnessPages.slice(0, 3).map((item) => {
                const price = getPrice(item);
                const image = getImage(item);
                const detailHref = `/wellness/${item.slug}`;
                const bookingHref =
                  `/booking?experienceId=${encodeURIComponent(item._id)}` +
                  `&experienceType=wellness`;

                return (
                  <article
                    key={item._id}
                    className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link href={detailHref} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#d9d4c7]">
                        {image ? (
                          <img
                            src={image}
                            alt={item.title || "Shanti wellness experience"}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#b9b19d] to-[#536b5b] text-6xl">
                            ✦
                          </div>
                        )}

                        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#354b3e]">
                          Shanti Wellness
                        </span>
                      </div>
                    </Link>

                    <div className="p-7">
                      <Link href={detailHref}>
                        <h3 className="text-2xl font-semibold text-[#26382f] transition group-hover:text-[#92764c]">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="mt-4 line-clamp-3 leading-7 text-stone-600">
                        {item.description ||
                          "Discover a restorative wellness experience at Shanti."}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-5">
                        {price ? (
                          <div>
                            <span className="text-xs uppercase tracking-wider text-stone-500">
                              From
                            </span>
                            <p className="text-xl font-bold text-[#26382f]">
                              {price.currency}{" "}
                              {price.amount.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-stone-500">
                            Contact us for pricing
                          </span>
                        )}

                        <Link
                          href={detailHref}
                          className="text-sm font-bold text-[#92764c] transition hover:text-[#26382f]"
                        >
                          Discover More →
                        </Link>
                      </div>

                      <Link
                        href={bookingHref}
                        className="mt-6 block rounded-full bg-[#263f33] px-5 py-3 text-center text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#a58a5e]"
                      >
                        Book This Experience
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-14 rounded-2xl border border-stone-200 bg-white p-10 text-center">
              <p className="text-xl font-semibold text-[#26382f]">
                Your wellness journey begins here.
              </p>
              <p className="mt-3 text-stone-600">
                Our wellness experiences will appear here once published
                in the administration panel.
              </p>
            </div>
          )}

          {wellnessPages.length > 3 && (
            <div className="mt-12 text-center">
              <Link
                href="/wellness"
                className="inline-flex rounded-full border border-[#263f33] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#263f33] transition hover:bg-[#263f33] hover:text-white"
              >
                View All Experiences
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* SPA EXPERIENCES */}
      <section
        id="spa"
        className="bg-[#faf8f3] px-6 py-24 lg:px-8"
      >
        <div className="mx-auto max-w-full">

          <SectionHeading
            eyebrow="The Art of Relaxation"
            title="Spa Experiences"
            description="Discover our collection of spa treatments and rituals, created to bring relaxation, comfort and a renewed sense of wellbeing."
          />

          {spaPages.length > 0 ? (
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {spaPages.slice(0, 3).map((item) => {
                const price = getPrice(item);
                const image = getImage(item);

                const detailHref = `/spa/${item.slug}`;

                const bookingHref =
                  `/booking?experienceId=${encodeURIComponent(item._id)}` +
                  `&experienceType=spa`;

                return (
                  <article
                    key={item._id}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link href={detailHref} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#d9d4c7]">
                        {image ? (
                          <img
                            src={image}
                            alt={item.title || "Shanti spa treatment"}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#b9b19d] to-[#536b5b] text-6xl">
                            ✦
                          </div>
                        )}

                        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#354b3e]">
                          Shanti Spa
                        </span>
                      </div>
                    </Link>

                    <div className="p-7">
                      <Link href={detailHref}>
                        <h3 className="text-2xl font-semibold text-[#26382f] transition group-hover:text-[#92764c]">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="mt-4 line-clamp-3 leading-7 text-stone-600">
                        {item.description ||
                          "Discover a relaxing spa experience at Shanti."}
                      </p>

                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-stone-100 pt-5">
                        {price ? (
                          <div>
                            <span className="text-xs uppercase tracking-wider text-stone-500">
                              From
                            </span>
                            <p className="text-xl font-bold text-[#26382f]">
                              {price.currency}{" "}
                              {price.amount.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-stone-500">
                            Contact us for pricing
                          </span>
                        )}

                        <Link
                          href={detailHref}
                          className="text-sm font-bold text-[#92764c] hover:text-[#26382f]"
                        >
                          Discover More →
                        </Link>
                      </div>

                      <Link
                        href={bookingHref}
                        className="mt-6 block rounded-full bg-[#263f33] px-5 py-3 text-center text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#a58a5e]"
                      >
                        Book This Treatment
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-14 rounded-2xl border border-stone-200 bg-white p-10 text-center">
              <p className="text-xl font-semibold text-[#26382f]">
                Our spa collection is coming soon.
              </p>
              <p className="mt-3 text-stone-600">
                Spa treatments will appear here once published in the administration panel.
              </p>
            </div>
          )}

          {spaPages.length > 3 && (
            <div className="mt-12 text-center">
              <Link
                href="/spa"
                className="inline-flex rounded-full border border-[#263f33] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#263f33] transition hover:bg-[#263f33] hover:text-white"
              >
                View All Spa Treatments
              </Link>
            </div>
          )}
        </div>
      </section>



      {/* WELLNESS PILLARS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionHeading
          eyebrow="The Shanti Experience"
          title="A More Meaningful Kind of Wellness"
          description="Every detail is an invitation to pause, breathe and give yourself the care you deserve."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon="✧"
            title="Restore"
            text="Make space for rest and relaxation through thoughtfully designed wellness experiences."
          />

          <FeatureCard
            icon="❋"
            title="Reconnect"
            text="Step away from daily distractions and reconnect with yourself in a peaceful setting."
          />

          <FeatureCard
            icon="◈"
            title="Renew"
            text="Leave feeling refreshed, balanced and ready to embrace everyday life."
          />
        </div>
      </section>


{/* GUEST REVIEWS */}
{feedback.length > 0 && (
  <section className="bg-[#f0ede5] px-6 py-24 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a58a5e]">
          Guest Experiences
        </p>

        <h2 className="mt-4 text-4xl font-light text-[#26382f] sm:text-5xl">
          What Our Guests Say
        </h2>

        <p className="mx-auto mt-5 max-w-2xl leading-8 text-stone-600">
          Discover what our guests say about their spa treatments
          and wellness experiences at Shanti.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {feedback.map((review) => (
          <article
            key={review._id}
            className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className="flex gap-1 text-xl text-[#b08d52]"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {Array.from(
                { length: 5 },
                (_, index) => (
                  <span key={index}>
                    {index < review.rating ? "★" : "☆"}
                  </span>
                )
              )}
            </div>

            <p className="mt-6 leading-8 text-stone-600">
              “{review.comment}”
            </p>

            <div className="mt-8 border-t border-stone-100 pt-5">
              <h3 className="font-semibold text-[#26382f]">
                {review.name}
              </h3>

              <p className="mt-1 text-sm text-[#92764c]">
                {review.page?.title || "Shanti Experience"}
              </p>

              <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">
                {review.page?.pageType?.name || "Guest Experience"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)}


      {/* PHILOSOPHY FEATURE */}
      <section className="bg-[#263f33] px-6 py-24 text-white lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d8c29a]">
              Time For Yourself
            </p>

            <h2 className="mt-5 text-4xl font-light leading-tight sm:text-5xl">
              Make room for
              <span className="block font-semibold italic text-[#dfcba7]">
                a little more peace.
              </span>
            </h2>

            <p className="mt-7 leading-8 text-white/75">
              Your wellbeing deserves attention. Whether you are looking
              for a moment of relaxation or a more complete wellness
              experience, Shanti welcomes you to slow down and make
              time for yourself.
            </p>

            <Link
              href="#experiences"
              className="mt-9 inline-flex rounded-full bg-[#d8c29a] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#26382f] transition hover:bg-white"
            >
              Find Your Experience
            </Link>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-8 sm:p-12">
            <p className="text-sm uppercase tracking-[0.25em] text-[#d8c29a]">
              Our Promise
            </p>

            <p className="mt-6 text-2xl font-light leading-relaxed sm:text-3xl">
              “A peaceful space, thoughtful care and time to reconnect
              with what matters most.”
            </p>

            <div className="mt-8 h-px w-20 bg-[#d8c29a]" />

            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-white/70">
              Shanti Spa & Wellness
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqPage?.faqs?.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a58a5e]">
              Need To Know
            </p>

            <h2 className="mt-4 text-4xl font-light text-[#26382f] sm:text-5xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-5 leading-8 text-stone-600">
              Helpful information to make your Shanti experience
              comfortable and enjoyable.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqPage.faqs.slice(0, 10).map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-stone-200 bg-white p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-[#26382f]">
                  <span>{faq.question}</span>
                  <span className="text-2xl text-[#a58a5e] transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                {faq.answer && (
                  <div className="mt-5 border-t border-stone-100 pt-5">
                    <RichTextContent
                      content={faq.answer}
                      className="prose max-w-none prose-p:leading-7 prose-p:text-stone-600"
                    />
                  </div>
                )}
              </details>
            ))}
          </div>

          {faqPage.faqs.length > 10 && (
            <div className="mt-8 text-center">
              <Link
                href="/faq"
                className="font-bold text-[#92764c] hover:text-[#26382f]"
              >
                View More Questions →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* FINAL CTA */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-[#e9e3d6] px-8 py-20 text-center sm:px-16">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#92764c]">
            Your Time. Your Wellbeing.
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-light leading-tight text-[#26382f] sm:text-5xl">
            Begin Your Journey
            <span className="block font-semibold italic">
              Towards Balance.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-stone-600">
            Discover a calmer way to care for yourself.
            Explore Shanti wellness experiences and find the
            treatment that feels right for you.
          </p>

          <Link
            href="#experiences"
            className="mt-9 inline-flex rounded-full bg-[#263f33] px-9 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#a58a5e]"
          >
            Explore Wellness Experiences
          </Link>
        </div>
      </section>
    </main>
  );
}


/*
 
# POPULAR EXPERIENCES
 
*/



/*

# POPULAR EXPERIENCES

*/

function PopularExperiences({
  experiences,
  getPrice,
}) {

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(true);

  /*
  
  # AUTOPLAY
  
  */

  useEffect(() => {


    if (
      !isPlaying ||
      experiences.length <= 1
    ) {

      return;

    }


    const interval =
      setInterval(
        () => {

          setCurrentIndex(
            (current) =>
              (current + 1) %
              experiences.length
          );

        },
        4000
      );


    return () => {

      clearInterval(
        interval
      );

    };


  }, [
    isPlaying,
    experiences.length,
  ]);

  /*
  
  # CURRENT EXPERIENCE
  
  */

  const current =
    experiences[
    currentIndex
    ];

  if (!current) {


    return null;


  }

  /*
  
  # NEXT
  
  */

  function nextExperience() {


    setCurrentIndex(
      (current) =>
        (current + 1) %
        experiences.length
    );


  }

  /*
  
  # PREVIOUS
  
  */

  function previousExperience() {


    setCurrentIndex(
      (current) =>
        (
          current -
          1 +
          experiences.length
        ) %
        experiences.length
    );


  }

  const price =
    getPrice(current);

  const detailHref =
    current.experienceType === "spa"
      ? `/spa/${current.slug}`
      : `/wellness/${current.slug}`;

  return (


    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">




      {/* ==================================
        LEFT SIDE
    ================================== */}



      {/* ==================================
        RIGHT SIDE
    ================================== */}


      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">


        {/* Main image */}

        <Link
          href={detailHref}
          className="group block"
        >

          <div className="relative aspect-[16/7] overflow-hidden bg-slate-200">

            {current.imageUrl ? (

              <img
                key={
                  current._id
                }
                src={
                  current.imageUrl
                }
                alt={
                  current.title
                }
                className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"
              />

            ) : (

              <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-600 to-slate-900 text-7xl">

                🏔️

              </div>

            )}


            {/* Overlay */}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />


            {/* Type */}

            <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 backdrop-blur">

              {current.experienceType}

            </div>


            {/* Image counter */}

            <div className="absolute right-5 top-5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">

              {currentIndex + 1} / {experiences.length}

            </div>


            {/* Image title */}

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

              <h3 className="text-2xl font-black sm:text-3xl">

                {current.title}

              </h3>


              {current.region?.name && (

                <p className="mt-2 text-sm font-semibold text-emerald-300">

                  📍 {current.region.name}

                </p>

              )}

            </div>

          </div>

        </Link>


        {/* Content */}

        <div className="p-6">


          <p className="line-clamp-2 leading-7 text-slate-600">

            {current.description ||
              "Discover an unforgettable Nepal adventure."}

          </p>


          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">


            {/* Price */}

            {price ? (

              <div>

                <span className="text-xs text-slate-500">

                  {price.label ||
                    "Price"}

                </span>


                <div className="text-2xl font-black text-slate-900">

                  {price.currency}{" "}

                  {price.amount.toLocaleString()}

                  <span className="ml-1 text-sm font-medium text-slate-400">

                    / person

                  </span>

                </div>

              </div>

            ) : (

              <div className="text-sm font-semibold text-slate-500">

                Contact us for pricing

              </div>

            )}


            <Link
              href={detailHref}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              View Details
            </Link>

          </div>


          {/* Controls */}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">


            <button
              type="button"
              onClick={
                previousExperience
              }
              aria-label="Previous popular experience"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
            >
              ←
            </button>


            <button
              type="button"
              onClick={() =>
                setIsPlaying(
                  (playing) =>
                    !playing
                )
              }
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
            >
              {isPlaying
                ? "❚❚ Pause"
                : "▶ Play"}
            </button>


            <button
              type="button"
              onClick={
                nextExperience
              }
              aria-label="Next popular experience"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
            >
              →
            </button>

          </div>
          {/* Autoplay status */}

          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">

            <span
              className={`h-2.5 w-2.5 rounded-full ${isPlaying
                ? "animate-pulse bg-emerald-500"
                : "bg-slate-300"
                }`}
            />

            {isPlaying
              ? "Autoplay is on"
              : "Autoplay is paused"}

          </div>


          {/* Dots */}

          <div className="mt-5 flex justify-center gap-2">

            {experiences.map(
              (
                experience,
                index
              ) => (

                <button
                  key={
                    experience._id
                  }
                  type="button"
                  onClick={() => {

                    setCurrentIndex(
                      index
                    );

                  }}
                  aria-label={`Show popular experience ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${index === currentIndex
                    ? "w-8 bg-emerald-500"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                />

              )
            )}

          </div>


        </div>


      </div>



      {/* Small numbered list */}

      <div className="mt-4 grid grid-cols-5 gap-2">


        {experiences.map(
          (
            experience,
            index
          ) => (

            <button
              key={
                experience._id
              }
              type="button"
              onClick={() => {

                setCurrentIndex(
                  index
                );

              }}
              className={`rounded-xl px-2 py-2 text-center text-xs font-bold transition ${index === currentIndex
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {index + 1}
            </button>

          )
        )}

      </div>








    </section>


  );

}


function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a58a5e]">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-4xl font-light leading-tight text-[#26382f] sm:text-5xl">
        {title}
      </h2>

      <p className="mt-6 text-lg leading-8 text-stone-600">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-9 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eee8dc] text-3xl text-[#92764c]">
        {icon}
      </div>

      <h3 className="mt-7 text-2xl font-semibold text-[#26382f]">
        {title}
      </h3>

      <p className="mt-4 leading-8 text-stone-600">
        {text}
      </p>
    </article>
  );
}

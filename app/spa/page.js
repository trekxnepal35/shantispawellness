
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";

import { resolveImage } from "@/lib/imageResolver";
import RichTextContent from "@/app/components/RichTextContent";


/*
=================================================
SEO METADATA
=================================================
*/

export const metadata = {
  title: "Luxury Spa Treatments | Shanti Spa & Wellness",
  description:
    "Discover luxurious spa treatments, massage therapies and restorative spa experiences at Shanti Spa & Wellness.",
};


/*
=================================================
GET SPA PAGES
=================================================
*/

async function getSpaPages() {
  await connectDB();

  const spaType = await PageType.findOne({
    slug: "spa",
    published: true,
  }).lean();

  if (!spaType) {
    return [];
  }

  const pages = await Page.find({
    pageType: spaType._id,
    published: true,
  })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return Promise.all(
    pages.map(async (page) => {
      const images = Array.isArray(page.images)
        ? page.images
        : [];

      const firstImage = images[0];

      const imageUrl = await resolveImage({
        url:
          typeof firstImage === "string"
            ? firstImage
            : firstImage?.url || page.imageUrl || "",

        storage:
          typeof firstImage === "object" && firstImage !== null
            ? firstImage.storage || page.imageStorage
            : page.imageStorage,

        key:
          typeof firstImage === "object" && firstImage !== null
            ? firstImage.key || ""
            : "",

        publicId:
          typeof firstImage === "object" && firstImage !== null
            ? firstImage.publicId || ""
            : "",
      });

      return {
        _id: page._id.toString(),
        slug: page.slug,

        title: page.title || "Spa Treatment",

        description:
          page.description ||
          page.excerpt ||
          "",

        highlight: page.highlight || "",

        imageUrl,

        // Pricing and booking information
        price: page.price || {},

        experienceType: spaType.slug,

        isBookable: spaType.bookable === true,
      };
    })
  );
}


/*
=================================================
SPA LISTING PAGE
=================================================
*/

export default async function SpaPage() {
  const pages = await getSpaPages();

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#26382f]">

      {/* =========================================
          SPA HERO
      ========================================= */}

      <section className="relative overflow-hidden bg-[#263f33] px-6 py-20 text-center text-white sm:py-28">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,194,154,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-4xl">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#d8c29a]">
            The Art of Relaxation
          </p>

          <h1 className="text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
            Spa Treatments
            <span className="mt-2 block font-semibold italic text-[#dfcba7]">
              At Shanti
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            Discover a world of relaxation and thoughtful care.
            Explore our collection of spa treatments and restorative
            rituals, designed to give you time to unwind, recharge
            and reconnect with yourself.
          </p>

        </div>

      </section>


      {/* =========================================
          SPA COLLECTION
      ========================================= */}

      <section className="mx-auto max-w-full px-6 py-16 lg:px-8">

        {/* SECTION INTRODUCTION */}

        <div className="mb-12 max-w-3xl">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a58a5e]">
            Discover Shanti
          </p>

          <h2 className="mt-4 text-3xl font-light leading-tight text-[#26382f] sm:text-4xl">
            Our Spa Collection
          </h2>

          <p className="mt-5 leading-8 text-stone-600">
            From relaxing massage therapies to rejuvenating spa rituals,
            explore treatments designed to make every visit a moment
            dedicated to your wellbeing.
          </p>

        </div>


        {/* EMPTY STATE */}

        {pages.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">

            <div className="text-5xl text-[#a58a5e]">
              ✧
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#26382f]">
              Spa Treatments Coming Soon
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-stone-600">
              Our collection of spa treatments is being prepared.
              Please check back soon to discover the Shanti spa experience.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-full bg-[#263f33] px-7 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#a58a5e]"
            >
              Back to Home
            </Link>

          </div>

        ) : (

          /* SPA CARDS */

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">

            {pages.map((page) => (

              <article
                key={page._id}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* IMAGE */}

                <Link
                  href={`/spa/${page.slug}`}
                  aria-label={`View ${page.title}`}
                  className="block"
                >

                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e3d6]">

                    {page.imageUrl ? (

                      <img
                        src={page.imageUrl}
                        alt={page.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-5xl text-[#a58a5e]">
                        ✧
                      </div>

                    )}

                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#354b3e]">
                      Shanti Spa
                    </span>

                  </div>

                </Link>


                {/* CARD CONTENT */}

                <div className="p-7">

                  <h2 className="text-xl font-bold text-[#26382f]">

                    <Link
                      href={`/spa/${page.slug}`}
                      className="transition hover:text-[#92764c]"
                    >
                      {page.title}
                    </Link>

                  </h2>


                  {/* HIGHLIGHTS */}

                  {/* {page.highlight && (

                    <div className="mt-3">

                      <RichTextContent
                        content={page.highlight}
                        className="prose prose-sm max-w-none prose-p:leading-6 prose-p:text-[#92764c] prose-headings:font-bold prose-headings:text-[#26382f] prose-a:text-emerald-700 prose-a:hover:underline"
                      />

                    </div>

                  )} */}


                  {/* DESCRIPTION */}

                  {page.description && (

                    <div className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">

                      <RichTextContent
                        content={page.description}
                        className="prose prose-sm max-w-none prose-p:my-0 prose-p:leading-6 prose-p:text-stone-600 prose-headings:font-bold prose-headings:text-[#26382f] prose-a:text-emerald-700 prose-a:hover:underline"
                      />

                    </div>

                  )}


                  {/* PRICE */}

                  {(() => {

                    const price = page.price;

                    if (!price) return null;

                    let amount = 0;
                    let label = "";

                    if (price.pricingType === "pax_based") {

                      const tiers = Array.isArray(price.paxPrices)
                        ? price.paxPrices
                        : [];

                      const validPrices = tiers
                        .map((tier) => Number(tier.pricePerPax))
                        .filter(
                          (value) =>
                            Number.isFinite(value) && value > 0
                        );

                      if (validPrices.length === 0) return null;

                      amount = Math.min(...validPrices);
                      label = "From";

                    } else {

                      amount = Number(price.amount);

                      if (!Number.isFinite(amount) || amount <= 0) {
                        return null;
                      }

                    }

                    return (

                      <div className="mt-6 border-t border-stone-100 pt-5">

                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                          {label || "Treatment Price"}
                        </span>

                        <div className="mt-1 text-2xl font-bold text-[#26382f]">

                          {price.currency || "USD"}{" "}
                          {amount.toLocaleString("en-US")}

                        </div>

                      </div>

                    );

                  })()}


                  {/* EXPLORE SPA */}

                  <Link
                    href={`/spa/${page.slug}`}
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-[#92764c] transition hover:text-[#26382f]"
                  >
                    Explore Treatment
                    <span aria-hidden="true">→</span>
                  </Link>


                  {/* BOOKING */}

                  {page.isBookable && (

                    <Link
                      href={`/booking?experienceId=${encodeURIComponent(page._id)}&experienceType=${page.experienceType}`}
                      className="mt-5 block rounded-full bg-[#263f33] px-5 py-3 text-center text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#a58a5e]"
                    >
                      Book This Treatment
                    </Link>

                  )}

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* =========================================
          CLOSING CTA
      ========================================= */}

      <section className="bg-[#263f33] px-6 py-20 text-center text-white">

        <div className="mx-auto max-w-3xl">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d8c29a]">
            Your Time Matters
          </p>

          <h2 className="mt-5 text-3xl font-light leading-tight sm:text-4xl">
            Make Time for
            <span className="block font-semibold italic text-[#dfcba7]">
              Yourself.
            </span>
          </h2>

          <p className="mt-6 leading-8 text-white/75">
            Take a moment to slow down and discover the spa treatment
            that feels right for you.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-[#d8c29a] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#26382f] transition hover:bg-white"
          >
            Discover Shanti
          </Link>

        </div>

      </section>

    </main>
  );
}

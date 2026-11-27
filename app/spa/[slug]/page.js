
import Link from "next/link";
import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";

import RichTextContent from "@/app/components/RichTextContent";
import SectionCollapse from "@/app/components/SectionCollapse";
import SectionNavigation from "@/app/components/SectionNavigation";
import FeedbackList from "@/app/components/FeedbackList";
import FeedbackForm from "@/app/components/FeedbackForm";
import YouTubeVideos from "@/app/components/YouTubeVideos";
import ImageGallery from "@/app/components/ImageGallery";
import BreadcrumbJsonLd from "@/app/components/BreadcrumbJsonLd";

import {
  resolvePageImage,
  resolveImage,
} from "@/lib/imageResolver";


/*
=================================================
GET SPA PAGE
=================================================
*/

async function getSpaPage(slug) {
  await connectDB();

  const spaType = await PageType.findOne({
    slug: "spa",
    published: true,
  }).lean();

  if (!spaType) {
    return null;
  }

  const page = await Page.findOne({
    slug: slug.toLowerCase(),
    pageType: spaType._id,
    published: true,
  })
    .populate("pageType")
    .lean();

  if (!page) {
    return null;
  }

  // Resolve FAQ image, including S3 images.
  if (page.faqImageUrl) {
    page.faqImageUrl = await resolveImage({
      url: page.faqImageUrl,
      storage: page.faqImageStorage,
      key: page.faqImageKey,
      publicId: page.faqImagePublicId,
    });
  }

  return page;
}


/*
=================================================
SEO METADATA
=================================================
*/

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const page = await getSpaPage(slug);

  if (!page) {
    return {
      title: "Spa Treatment Not Found",
      description: "The requested Shanti spa treatment could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    page.seo?.metaTitle ||
    `${page.title} | Shanti Spa & Wellness`;

  const description =
    page.seo?.metaDescription ||
    page.description ||
    `Discover ${page.title} at Shanti Spa & Wellness.`;

  const mainImage = await resolvePageImage(page);

  const ogImage =
    page.seo?.ogImage ||
    mainImage ||
    undefined;

  return {
    title,
    description,

    keywords: page.seo?.keywords || [],

    alternates: page.seo?.canonicalUrl
      ? {
          canonical: page.seo.canonicalUrl,
        }
      : undefined,

    robots: page.seo?.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },

    openGraph: {
      title: page.seo?.ogTitle || title,
      description: page.seo?.ogDescription || description,
      type: "website",
      images: ogImage ? [ogImage] : [],
    },
  };
}


/*
=================================================
SPA DETAIL PAGE
=================================================
*/

export default async function SpaDetailPage({ params }) {
  const { slug } = await params;

  const page = await getSpaPage(slug);

  if (!page) {
    notFound();
  }

  /*
  ================================================
  IMAGES
  ================================================
  */

  const spaImageUrl = await resolvePageImage(page);
    /*
========================================
GALLERY IMAGES
========================================
*/

const galleryImages =
Array.isArray(page.images)
  ? await Promise.all(
      page.images.map(async (image) => {

        const url = await resolveImage(image);

        return {
          url,
          alt:
            image.alt ||
            page.title ||
            "Spa image",
        };

      })
    )
  : [];


  /*
  ================================================
  PRICING AND BOOKING
  ================================================
  */

  const pricingType = page.price?.pricingType || "fixed";

  const fixedPrice = Number(page.price?.amount || 0);

  const paxPrices = Array.isArray(page.price?.paxPrices)
    ? page.price.paxPrices
    : [];

  const experienceType = "spa";

  const spaType = await PageType.findOne({
    slug: "spa",
  })
    .select("bookable")
    .lean();

  const canBook = spaType?.bookable === true;


  /*
  ================================================
  BREADCRUMBS
  ================================================
  */

  const breadcrumbs = [
    {
      name: "Home",
      url: "/",
    },
    {
      name: "Spa",
      url: "/spa",
    },
    {
      name: page.title,
      url: `/spa/${page.slug}`,
    },
  ];


  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <main className="min-h-screen bg-[#faf8f3]">

        {/* =========================================
            SPA HERO
        ========================================= */}

        <section className="bg-[#263f33] px-6 py-16 text-white sm:py-20 lg:py-24">
          <div className="mx-auto max-w-full">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d8c29a]">
              Shanti Spa & Wellness
            </p>

            {/* <h1 className="mt-5 text-3xl font-light leading-tight sm:text-3xl lg:text-3xl">
              {page.title}
            </h1> */}

            {page.description && (
              <p className="mt-6  max-w-4xl text-base leading-8 text-white/80 sm:text-lg">
                {page.description}
              </p>
            )}

          </div>
        </section>


        {/* =========================================
            MAIN PAGE CONTENT
        ========================================= */}

        <section className="mx-auto max-w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

          {/* IMAGE GALLERY */}

          <ImageGallery
            images={galleryImages}
            fallbackImage={spaImageUrl}
            fallbackAlt={page.title}
          />


          {/* =======================================
              SECTION NAVIGATION
          ======================================= */}

          <SectionNavigation
            sections={[
              {
                id: "overview",
                label: "Overview",
                icon: "📖",
              },
              {
                id: "highlight",
                label: "Highlights",
                icon: "⭐",
              },
              {
                id: "itinerary",
                label: "Treatment Details",
                icon: "✧",
              },
              {
                id: "page-information",
                label: "Information",
                icon: "ℹ️",
              },
              {
                id: "included",
                label: "What's Included",
                icon: "✓",
              },
              {
                id: "excluded",
                label: "What's Not Included",
                icon: "×",
              },
              {
                id: "important-information",
                label: "Important Information",
                icon: "⚠️",
              },
              {
                id: "map-faq",
                label: "FAQs",
                icon: "❓",
              },
              {
                id: "reviews",
                label: "Reviews",
                icon: "💬",
              },
            ]}
          />


          {/* =======================================
              CONTENT AND SIDEBAR
          ======================================= */}

          <div className="mx-auto max-w-full px-2 py-12">

            <div className="grid gap-10 lg:grid-cols-3">

              {/* LEFT CONTENT */}

              <div className="lg:col-span-2">

                {/* OVERVIEW */}

                {page.content && (
                  <article
                    id="overview"
                    className="rounded-2xl bg-white p-6 shadow-sm sm:p-10"
                  >
                    <SectionCollapse title="Overview">

                      {/* <h2 className="text-2xl font-bold text-[#26382f] sm:text-3xl">
                        Discover This Treatment
                      </h2> */}

                      <RichTextContent
                        content={page.content}
                        className="prose mt-5 max-w-none prose-p:leading-8 prose-p:text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-emerald-700 prose-a:hover:underline"
                      />

                    </SectionCollapse>
                  </article>
                )}


                {/* HIGHLIGHTS */}

                {page.highlight && (
                  <article
                    id="highlight"
                    className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10"
                  >
                    <h2 className="text-2xl font-bold text-[#26382f]">
                     Highlights
                    </h2>

                    <RichTextContent
                      content={page.highlight}
                      className="prose mt-5 max-w-none prose-p:leading-8 prose-p:text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-emerald-700 prose-a:hover:underline"
                    />
                  </article>
                )}


                {/* TREATMENT DETAILS / ITINERARY */}

                {page.itinerary?.length > 0 && (
                  <section id="itinerary" className="mt-12">

                    <SectionCollapse title="Treatment Details">

                      <div className="space-y-5">

                        {page.itinerary.map((item, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
                          >

                            <SectionCollapse
                              title={
                                item.title ||
                                `Treatment Step ${item.day || index + 1}`
                              }
                            >

                              {item.description && (
                                <RichTextContent
                                  content={item.description}
                                  className="prose max-w-none prose-p:leading-7 prose-p:text-gray-600 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-emerald-700"
                                />
                              )}

                              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">

                                {item.walkingHours && (
                                  <span>
                                    ⏱️ Duration: {item.walkingHours}
                                  </span>
                                )}

                                {item.accommodation && (
                                  <span>
                                    🧖 Treatment: {item.accommodation}
                                  </span>
                                )}

                                {item.meal && (
                                  <span>
                                    🍵 Refreshments: {item.meal}
                                  </span>
                                )}

                              </div>

                            </SectionCollapse>

                          </div>
                        ))}

                      </div>

                    </SectionCollapse>

                  </section>
                )}

              </div>


              {/* =================================
                  BOOKING SIDEBAR
              ================================= */}

              <aside>
                <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-lg">

                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a58a5e]">
                    Shanti Spa
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#26382f]">
                    Treatment Price
                  </h2>


                  {/* FIXED PRICE */}

                  {pricingType === "fixed" && fixedPrice > 0 ? (
                    <p className="mt-4 text-2xl font-bold text-emerald-800">
                      {page.price?.currency || "USD"}{" "}
                      {fixedPrice.toLocaleString()}

                      <span className="ml-1 text-sm font-normal text-gray-500">
                        / person
                      </span>
                    </p>
                  ) : pricingType === "pax_based" && paxPrices.length > 0 ? (

                    /* PERSON-BASED PRICE */

                    <div className="mt-4 space-y-3">

                      {paxPrices.map((tier, index) => (
                        <div
                          key={index}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-3 text-sm"
                        >

                          <span className="text-gray-600">
                            {tier.minPax}–{tier.maxPax ?? "16+"} people
                          </span>

                          <span className="font-semibold text-gray-900">
                            {page.price?.currency || "USD"}{" "}
                            {Number(
                              tier.pricePerPax || 0
                            ).toLocaleString()}

                            <span className="font-normal text-gray-500">
                              {" "}/ person
                            </span>
                          </span>

                        </div>
                      ))}

                    </div>

                  ) : (
                    <p className="mt-3 text-sm text-gray-600">
                      Contact us for pricing.
                    </p>
                  )}


                  {/* BOOKING BUTTON */}

                  {canBook && (
                    <Link
                      href={`/booking?experienceId=${page._id.toString()}&experienceType=${experienceType}`}
                      className="mt-6 block rounded-lg bg-[#263f33] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#a58a5e]"
                    >
                      Book This Treatment
                    </Link>
                  )}


                  {/* ENQUIRY BUTTON */}

                  <Link
                    href={`/enquiry?experienceId=${page._id.toString()}&experienceType=${experienceType}`}
                    className={`block rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-100 ${
                      canBook ? "mt-3" : "mt-6"
                    }`}
                  >
                    Make an Enquiry
                  </Link>

                </div>
              </aside>

            </div>


            {/* =====================================
                INCLUSIONS
            ===================================== */}

            {page.inclusions?.length > 0 && (
              <section id="included" className="mt-12">

                <SectionCollapse title="What's Included">

                  <hr />

                  <ul className="space-y-3">

                    {page.inclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3"
                      >
                        <span className="font-bold text-green-600">
                          ✓
                        </span>

                        <span>{item}</span>
                      </li>
                    ))}

                  </ul>

                </SectionCollapse>

              </section>
            )}


            {/* =====================================
                EXCLUSIONS
            ===================================== */}

            {page.exclusions?.length > 0 && (
              <section id="excluded" className="mt-12">

                <SectionCollapse title="What's Not Included">

                  <hr />

                  <ul className="space-y-3">

                    {page.exclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3"
                      >
                        <span className="font-bold text-red-600">
                          ×
                        </span>

                        <span>{item}</span>
                      </li>
                    ))}

                  </ul>

                </SectionCollapse>

              </section>
            )}


            {/* =====================================
                IMPORTANT INFORMATION
            ===================================== */}

            {page.importantInformation && (
              <section
                id="important-information"
                className="mt-12 rounded-xl bg-white p-6 shadow-sm"
              >

                <SectionCollapse title="Important Information">

                  <hr />

                  <RichTextContent
                    content={page.importantInformation}
                    className="prose max-w-none prose-p:leading-7 prose-p:text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-emerald-700 prose-a:hover:underline"
                  />

                </SectionCollapse>

              </section>
            )}


            {/* =====================================
                FREQUENTLY ASKED QUESTIONS
            ===================================== */}

            {Array.isArray(page.faqs) && page.faqs.length > 0 && (
              <section
                id="map-faq"
                className="mx-auto mt-16 max-w-full"
              >

                <SectionCollapse title="Frequently Asked Questions">

                  <hr />

                  <div className="grid gap-10 lg:grid-cols-3">

                    {/* FAQ IMAGE */}

                    {page.faqImageUrl && (
                      <div className="lg:col-span-1">

                        <div className="sticky top-24 overflow-hidden rounded-2xl">

                          <Link
                            href={page.faqImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >

                            <img
                              src={page.faqImageUrl}
                              alt={`${page.title} FAQ`}
                              loading="lazy"
                              className="h-[420px] w-full object-cover"
                            />

                          </Link>

                        </div>

                      </div>
                    )}


                    {/* FAQ CONTENT */}

                    <div
                      className={
                        page.faqImageUrl
                          ? "lg:col-span-2"
                          : "lg:col-span-3"
                      }
                    >

                      <div className="mb-8">

                        <p className="text-sm font-semibold uppercase tracking-wider text-[#a58a5e]">
                          Frequently Asked Questions
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-[#26382f]">
                          Questions About {page.title}
                        </h2>

                        <p className="mt-3 text-gray-600">
                          Find answers to common questions about this spa treatment.
                        </p>

                      </div>


                      <div className="space-y-4">

                        {page.faqs.map((faq, index) => (
                          <details
                            key={index}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                          >

                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-gray-900">

                              <span>{faq.question}</span>

                              <span className="text-2xl text-[#a58a5e] transition-transform duration-300 group-open:rotate-45">
                                +
                              </span>

                            </summary>

                            {faq.answer && (
                              <div className="mt-4 border-t border-gray-100 pt-4">

                                <RichTextContent
                                  content={faq.answer}
                                  className="prose max-w-none prose-p:leading-7 prose-p:text-gray-600 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-emerald-700 prose-a:hover:underline"
                                />

                              </div>
                            )}

                          </details>
                        ))}

                      </div>

                    </div>

                  </div>

                </SectionCollapse>

              </section>
            )}


            {/* =====================================
                YOUTUBE VIDEOS
            ===================================== */}

            {Array.isArray(page.youtubeVideos) &&
              page.youtubeVideos.length > 0 && (
                <section className="mx-auto mt-16 max-w-6xl">

                  <YouTubeVideos
                    videos={page.youtubeVideos}
                  />

                </section>
              )}


            {/* =====================================
                CUSTOMER REVIEWS
            ===================================== */}

            <section
              id="reviews"
              className="mx-auto mt-16 max-w-5xl"
            >

              <SectionCollapse title="Customer Reviews">

                <hr />

                <FeedbackList
                  pageId={String(page._id)}
                />

              </SectionCollapse>


              <SectionCollapse title="Share Your Experience">

                <FeedbackForm
                  pageId={String(page._id)}
                  pageTitle={page.title}
                />

              </SectionCollapse>

            </section>


            {/* =====================================
                BACK TO SPA
            ===================================== */}

            <div className="mt-10 text-center">

              <Link
                href="/spa"
                className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-900"
              >
                <span aria-hidden="true">←</span>
                Back to Spa Treatments
              </Link>

            </div>

          </div>

        </section>

      </main>
    </>
  );
}

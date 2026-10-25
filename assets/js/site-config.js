/* ============================================================================
   SAMMER STUDIOS, SITE CONFIG
   ----------------------------------------------------------------------------
   This is the only file you need to edit for day-to-day changes:
   contact info, prices, session packages, and the two integrations
   (a form backend and a scheduling calendar).

   Everything below is plain text. Change the values between the quotes.
   ========================================================================== */

const SITE = {

  /* --------------------------------------------------------------------
     1. IDENTITY
     ------------------------------------------------------------------ */
  name: "Sammer Studios",
  photographer: "Sammer Marzouk",
  tagline: "Portraits, events, and prints. Chicago.",
  baseCity: "Chicago, Illinois",

  // Shown on the contact page and used as the fallback for form submissions.
  email: "marzouksammer@gmail.com",

  // Leave as "" to hide the phone line entirely.
  phone: "",

  // ---- Home page hero -------------------------------------------------
  hero: {
    eyebrow: "Chicago photography",
    tag: "Portraits, engagements, and events across the city. Fine-art prints and hand calligraphy from the same studio.",
    chips: ["Headshots", "Engagements", "Events", "Product", "Calligraphy"],
  },

  // Arabic wordmark shown in the footer and beside the calligraphy work.
  // This is type, not a photograph of his hand-lettering.
  arabicMark: "سامر مرزوق",

  social: {
    studioInstagram: "sammerstudios",   // @sammerstudios, the photography account
    personalInstagram: "sammer_marz",   // @sammer_marz,  personal
  },


  /* --------------------------------------------------------------------
     2. INTEGRATIONS: the two things to set up before launch
     ------------------------------------------------------------------ */

  // -- FORM BACKEND ----------------------------------------------------
  // Booking requests and print orders POST here and arrive as email.
  //
  // This is set to FormSubmit, which needs no account: the first message sent
  // through it triggers a one-time confirmation email to the address below.
  // Click the link in that email once and every submission from then on lands
  // in your inbox. Nothing else to do.
  //
  // Two things worth knowing:
  //   1. After you confirm, FormSubmit shows you a random token. Swapping the
  //      address below for that token stops your email address sitting in a
  //      file that every visitor downloads. Worth doing, not urgent: your
  //      address is already on the contact page.
  //   2. If you would rather use Formspree, sign up there, create a form, and
  //      paste its endpoint here instead. The site does not care which.
  formEndpoint: "https://formsubmit.co/ajax/marzouksammer@gmail.com",

  // -- SCHEDULING ------------------------------------------------------
  // Paste a booking-page URL here and a live "Pick a time" calendar appears on
  // the Book page. Leave it "" and visitors use the request form instead,
  // which works fine.
  //
  // Google Calendar, on marzouksammer@gmail.com, free:
  //   1. calendar.google.com, signed in as marzouksammer@gmail.com
  //   2. Create > Appointment schedule
  //   3. Name it (say "Photography session"), set the length and the hours
  //      you are willing to shoot, and save
  //   4. Open it again and press "Share" or "Open booking page"
  //   5. Copy that booking page link and paste it below
  //
  // The link looks like:
  //   https://calendar.google.com/calendar/appointments/schedules/AcZssZ...
  //
  // Calendly and Cal.com links work here too. Whatever you paste is loaded in
  // an iframe, so it must be a page that allows embedding: a Google booking
  // page does, a plain calendar.google.com URL does not.
  schedulingEmbedUrl: "",

  // -- PAYMENT ---------------------------------------------------------
  // Shown to the customer as soon as they place a print order, and repeated
  // in the confirmation. Set a handle to "" to hide that option.
  payment: {
    venmo:  "Sammer-Marzouk",              // venmo.com/u/<handle>
    paypal: "SammerMarzouk",               // paypal.me/<handle>
    note:   "Send the total once I confirm the order is good to go. If anything is out of stock or needs a different crop I will tell you before you pay.",
  },


  /* --------------------------------------------------------------------
     3. SESSION PACKAGES  (the Book page)
     ------------------------------------------------------------------ */
  packages: [
    {
      id: "eras",
      name: "ERAS & Professional Headshots",
      price: "$175",
      duration: "45 minutes",
      summary: "The residency application photo, done properly. I am an MD/PhD student myself, so I know the crop ERAS wants, the look programs expect, and how tight your deadline is.",
      includes: [
        "45-minute session, one or two backdrops",
        "10 fully edited images, skin retouched lightly",
        "Correctly cropped and sized for ERAS, LinkedIn and department pages",
        "Files back within 72 hours, faster if you are up against a deadline",
      ],
    },
    {
      id: "engagement",
      name: "Engagements & Couples",
      price: "$350",
      duration: "90 minutes",
      summary: "Two locations, golden hour if you want it. If you would like Arabic calligraphy for the invitations afterwards, that is the same pair of hands.",
      includes: [
        "90-minute session, up to two locations",
        "40 fully edited images",
        "Outfit change welcome",
        "Optional calligraphy for save-the-dates and invitations",
      ],
    },
    {
      id: "graduation",
      name: "Graduations & Milestones",
      price: "$325",
      duration: "90 minutes",
      summary: "Cap, gown, family, and the building you spent years inside. Built around Chicago campuses, but I will go where the meaning is.",
      includes: [
        "90-minute session, up to two locations",
        "30 fully edited images",
        "Family and group shots included",
        "Online gallery, download in a week",
      ],
    },
    {
      id: "event",
      name: "Events",
      price: "$150 / hour",
      duration: "2 hour minimum",
      summary: "Openings, receptions, parades, department parties, and recitals. I was an official photographer for Chicago's 2026 Arts in the Dark Parade, and I have covered a hospital opening and enough academic events to know how to stay out of the way of the people running them.",
      includes: [
        "Two-hour minimum",
        "Roughly 60 edited images per hour",
        "Comfortable in hospitals, labs and campus buildings",
        "Preview set within 48 hours",
      ],
    },
    {
      id: "product",
      name: "Product & Brand",
      price: "From $500",
      duration: "Half day",
      summary: "Food, packaging, and the flat-lay-and-storefront work small businesses actually need. Shot in daylight wherever the product allows it.",
      includes: [
        "Half-day shoot, up to 4 hours",
        "25 fully edited images",
        "Commercial licence included",
        "Styling help if you want it",
      ],
    },
    {
      id: "vintage",
      name: "Vintage & Camcorder",
      price: "From $150",
      duration: "Add on, or book alone",
      summary: "Shot on a 2006 Canon Rebel and a standard-definition Sony Handycam. Soft, grainy, and dated on purpose, and it suits a room full of people better than anything sharper does. There are Handycam clips on the home page if you want to see it before you decide.",
      includes: [
        "2006 Canon Rebel XTi stills",
        "Sony DCR-DVD650 Handycam video, standard definition",
        "Good for parties, dinners and receptions",
        "Add to any session, or book on its own",
        "Delivered ungraded, the way the cameras saw it",
      ],
    },
    {
      id: "calligraphy",
      name: "Calligraphy Commissions",
      price: "From $60",
      duration: "1 to 2 weeks",
      summary: "Arabic script by hand, in ink on paper. Names, verses, invitations, table cards, and gifts. Quoted per piece once I know the words and the size.",
      includes: [
        "Arabic script, classical hands",
        "Names and short phrases from $60",
        "Invitation and signage sets quoted per job",
        "Digitised version supplied for printing",
      ],
    },
  ],

  // Shown in small print under the packages.
  packageNote: "Every price here is a starting point and I am open to negotiating on the specifics. Tell me the scope, the deadline, and the budget you are working with, and I will tell you honestly whether it works. Prices cover Chicago; further afield, travel is billed at cost and quoted before you commit. Students and campus groups, say so when you write, there is a rate for you.",

  /* --------------------------------------------------------------------
     3b. WHO I HAVE WORKED WITH  (the Experience strip)
     ------------------------------------------------------------------
     NOTE: your message said "Snacklava" but the product photographs are
     branded Dar Baklava, so that is the name used here. If the client is
     actually Snacklava, or both, change the line below.
     ------------------------------------------------------------------ */
  experience: [
    { client: "Arts in the Dark Parade",  work: "Official photographer, 2026", kind: "Event" },
    { client: "Northwestern Medicine",  work: "Bronzeville location opening", kind: "Event" },
    { client: "American Muslim Physician Association", work: "Annual banquet coverage", kind: "Event" },
    { client: "Dar Baklava",            work: "Product and packaging photography", kind: "Product" },
    { client: "Medical students",       work: "ERAS residency application headshots", kind: "Portrait" },
    { client: "Private clients",        work: "Engagement and couples sessions", kind: "Portrait" },
    { client: "Graduating classes",     work: "Campus graduation portraits", kind: "Portrait" },
  ],

  /* --------------------------------------------------------------------
     4. PRINT SHOP
     ------------------------------------------------------------------
     HOW THIS WORKS
     A visitor picks a photo and a size, fills in their address, and the
     order arrives in your inbox. You then order that print from Google
     Photos, ship it to them, and keep the difference.

     `price` is what the customer pays.

     Your own supplier costs are deliberately NOT in this file. Every visitor
     downloads it, so anything written here is public. They live in
     tools/costs.local.md, which is gitignored and never published.
     `ratio` is the print's aspect ratio, used to warn about cropping.
     ------------------------------------------------------------------ */
  printProducts: [
    { id: "print-4x6",    family: "Print",  size: '4 × 6"',   ratio: "3:2", price: 12 },
    { id: "print-5x7",    family: "Print",  size: '5 × 7"',   ratio: "7:5", price: 18 },
    { id: "print-8x10",   family: "Print",  size: '8 × 10"',  ratio: "5:4", price: 28 },
    { id: "print-11x14",  family: "Print",  size: '11 × 14"', ratio: "14:11", price: 45 },
    { id: "print-16x20",  family: "Print",  size: '16 × 20"', ratio: "5:4", price: 70 },

    { id: "canvas-11x14", family: "Canvas", size: '11 × 14"', ratio: "14:11", price: 95 },
    { id: "canvas-16x20", family: "Canvas", size: '16 × 20"', ratio: "5:4", price: 135 },
    { id: "canvas-20x30", family: "Canvas", size: '20 × 30"', ratio: "3:2", price: 195 },

    { id: "framed-8x10",  family: "Framed", size: '8 × 10"',  ratio: "5:4", price: 85 },
    { id: "framed-11x14", family: "Framed", size: '11 × 14"', ratio: "14:11", price: 120 },
    { id: "framed-16x20", family: "Framed", size: '16 × 20"', ratio: "5:4", price: 175 },
  ],

  familyNotes: {
    Print:  "Lustre photo paper. Sent flat in a rigid mailer.",
    Canvas: "Wrapped canvas on a wooden frame, ready to hang. No glass.",
    Framed: "Matted print in a simple black or white frame, behind glass.",
  },

  // Collections that are never sold as prints. Both are full of identifiable
  // people who sat for a commission or turned up to an event. Agreeing to be
  // on the website is not agreeing to be sold as wall art.
  printExclude: ["portraits", "events"],

  shippingFlat: 9,          // flat shipping added to every print order
  currency: "USD",
  currencySymbol: "$",

  // Shown at checkout. Be honest here: it sets expectations and prevents
  // the awkward "where is my print" email three weeks later.
  fulfilmentNote: "Prints are made to order and usually ship within 7–10 days. Nothing is charged when you submit. I will confirm the order and send an invoice first.",


  // Different photograph of Sammer in each place, so the same face is not
  // repeated down the site. Slugs come from the hidden "me" collection.
  portraitsOfMe: {
    aboutPage:   "me-with-camera",
    homeTeaser:  "under-the-lanterns",
    bookPage:    "me-at-the-bridge",
    contact:     "records",
  },

  // Where the subject sits in a frame, as "x y" percentages. Only needed when
  // a crop cuts something important. 50% 50% is the default and is left out.
  focus: {
    "records":          "50% 32%",   // his face sits high in the frame
    "me-at-the-bridge": "50% 35%",
    "the-dome":         "60% 50%",   // centres the dome's hub in a square crop
  },

  /* --------------------------------------------------------------------
     4b. TESTIMONIALS
     ------------------------------------------------------------------
     Paste each person's ACTUAL words. An entry with an empty quote is
     skipped, and if every quote is empty the whole section stays hidden,
     so nothing invented ever goes live.

     Ask them something like: "Would you mind sending me a sentence or two
     about what the session was like? I would like to put it on my site
     with just your first name and what we shot."
     ------------------------------------------------------------------ */
  testimonials: [
    {
      quote: "Great and professional. Allowed me to see the photos, and much cheaper than the other options. Super great quality and used on my application. Highest recommendation.",
      who: "Medical student",
      detail: "ERAS headshots",
    },
    {
      quote: "We could not be happier with the pictures. They were super great, and Sammer was very accommodating.",
      who: "Engaged couple",
      detail: "Engagement session",
    },
    {
      quote: "Super professional. Loved the pictures and how they came out. Would recommend.",
      who: "Physician",
      detail: "Conference portraits",
    },
  ],

  /* --------------------------------------------------------------------
     5. ABOUT PAGE COPY
     ------------------------------------------------------------------ */
  about: {
    lead: "I have been photographing for about five years. I am also an MD/PhD student at Northwestern, which turns out to matter more to this work than it sounds like it should.",
    body: [
      "It means I am comfortable in the places other photographers get nervous: hospitals, labs, lecture halls, a building on its opening day. I shot Northwestern Medicine's Bronzeville opening. I photograph ERAS headshots for people applying to residency, and I know what that photo has to do, because I am on the same road.",
      "The rest of the work is engagements, graduations, events, and product photography for small businesses. I shot Dar Baklava's packaging and pastries on a Canon Rebel XTi from 2006, which I still use, because the camera matters a great deal less than people think. In between I walk the city at night, which is where most of the prints on this site come from: the Chicago River at blue hour, New York at two in the morning, a summer in Jordan, and more Smoky Mountain creeks than strictly necessary.",
      "I also write Arabic calligraphy, by hand in ink. It started as its own thing and has quietly become part of the job, mostly for invitations and gifts. If you are booking an engagement session and want the save-the-dates written by hand, that is the same pair of hands.",
      "I also keep an old standard-definition Handycam around. If you want a set of pictures or a clip that looks like it was found rather than made, that is a thing I will happily do.",
      "Everything on this site is available as a print. I make them to order.",
    ],
    gear: [
      "Sony A7 IV",
      "Sony FE 28-70mm f/3.5-5.6 OSS",
      "Canon EOS Rebel XTi, 2006, still working",
      "Sony DCR-DVD650 Handycam, Carl Zeiss lens, standard definition",
      "Ink, nib, and a light box",
    ],
  },
};

/* Nothing below this line needs editing. */
if (typeof module !== "undefined") { module.exports = SITE; }

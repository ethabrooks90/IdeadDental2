// Verified against the live site mirror (www.ideadentistry.com) on 2026-09-17.
// Do not add facts here that aren't sourced from the live site or explicit client input.

export const business = {
  name: 'Idea Dental',
  phone: '(832) 664-8640',
  phoneHref: 'tel:+18326648640',
  address: {
    line1: '216 W Little York Road, Suite B',
    line2: 'Houston, TX 77076',
  },
  mapsUrl: 'https://goo.gl/maps/PBzLzgfFhGXrSZxf9',
  social: {
    facebook: 'https://www.facebook.com/Idea-Dental-at-West-Little-York-PLLC-137635463309853',
    yelp: 'https://www.yelp.com/biz/idea-dental-houston',
  },
}

export const hours = [
  { day: 'Monday', time: '10:00 AM – 4:00 PM', note: 'Surgeries only' },
  { day: 'Tuesday', time: '10:00 AM – 6:00 PM', note: 'General dentistry & walk-ins' },
  { day: 'Wednesday', time: '10:00 AM – 6:00 PM', note: 'General dentistry & walk-ins' },
  { day: 'Thursday', time: '11:00 AM – 4:00 PM', note: 'Braces adjustments & surgery' },
  { day: 'Friday', time: 'Closed', note: '' },
  { day: 'Saturday', time: 'By appointment only', note: '' },
  { day: 'Sunday', time: 'Closed', note: '' },
]

export const nav = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Technology', href: '#technology' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export const serviceCategories = [
  {
    key: 'general',
    label: 'General Dentistry',
    description:
      'Helping our patients maintain a healthy mouth and smile is the main goal of general dentistry. We prefer to provide more minor, preventive care than to see patients suffer with more intensive treatments from a problem that was not managed in time.',
    treatments: ['Teeth Whitening', 'Root Canals'],
  },
  {
    key: 'restorative',
    label: 'Restorative Dentistry',
    description:
      "Idea Dental is committed to offering a full range of dentistry services. Whether you've had repairs or need a complete replacement, we recommend continual check-ups to assess your gums and bone density.",
    treatments: ['Dental Implants'],
  },
  {
    key: 'cosmetic',
    label: 'Cosmetic Dentistry',
    description:
      'A beautiful smile is one of the most sought after cosmetic features in the world. Whether through minor adjustments or major treatment plans, our cosmetic dentistry practice aims to improve your smile and help you build confidence.',
    treatments: ['Veneers', 'Dentures', 'Invisalign'],
  },
  {
    key: 'orthodontic',
    label: 'Orthodontic Services',
    description:
      'Our ultimate goal is to craft you a perfect smile that you are proud to show off. We are proud to offer several different treatment options for straighter teeth and a beautiful smile.',
    treatments: [
      'Traditional Braces',
      'Clear Braces',
      'Invisalign',
      'Invisalign for Teens',
      'Retention',
      'iTero Intraoral Scanner',
      'Early Treatment',
      'Adult Treatment',
      'Braces for Teens',
    ],
  },
]

// Tooth explorer. `description` is plain, textbook anatomy only — no claims
// about the practice, outcomes or treatment. `service` links each part to
// one of the real categories above and `relatedTreatment` (where set) names
// a treatment that category already lists.
export const toothParts = [
  {
    key: 'enamel',
    label: 'Enamel',
    description: 'The hard, protective outer layer that covers the crown of the tooth.',
    service: 'cosmetic',
    relatedTreatment: 'Veneers',
  },
  {
    key: 'crown',
    label: 'Crown',
    description: 'The part of the tooth you can see above the gum line.',
    service: 'restorative',
    relatedTreatment: null,
  },
  {
    key: 'pulp',
    label: 'Pulp',
    description: 'The soft inner core of the tooth, where its nerves and blood vessels are.',
    service: 'general',
    relatedTreatment: 'Root Canals',
  },
  {
    key: 'root',
    label: 'Root',
    description: 'The part below the gum line that anchors the tooth in the jawbone.',
    service: 'restorative',
    relatedTreatment: 'Dental Implants',
  },
] as const

// Live homepage pricing table — confirmed as source of truth over the
// unused/legacy table found commented out in the New Patients page source.
export const pricing = [
  { item: 'Adult Cleaning', ours: '$75', other: '$98' },
  { item: 'Simple Extraction', ours: '$250', other: '$350' },
  { item: '2-Surface White Filling', ours: '$180', other: '$224' },
  { item: 'Porcelain Crown', ours: '$900', other: '$1,136' },
  { item: 'Child or Adult Braces', ours: 'Starting at $3,200', other: '$5,755' },
  { item: 'Invisalign', ours: '$3,800', other: '$5,978' },
  { item: 'Single Implant with Crown', ours: '$3,500', other: '$5,462' },
]

export const doctors = [
  {
    key: 'vu',
    name: 'Dr. Stephanie Vu',
    credentials: 'DDS',
    photo: 'stephanie-vu.jpg',
    bio: [
      'Stephanie Vu, DDS, is a dedicated and caring dentist who provides exceptional care to her patients at Idea Dental, conveniently located in Houston, Texas.',
      'Dr. Vu graduated with a bachelor’s degree in biology from the University of Texas at Austin. She discovered her passion for dentistry during her undergraduate years while volunteering at the San Jose Clinic in Houston, and decided to pursue her dental degree.',
      'Dr. Vu earned her Doctor of Dental Surgery from the University of Texas School of Dentistry at Houston. She graduated from her dental program with honors and won the prestigious Student Achievement Award of Endodontics.',
    ],
  },
  {
    key: 'rathi',
    name: 'Dr. Nakul Rathi',
    credentials: 'Implants & Full Mouth Rehabilitation',
    photo: 'nukul-rathi.jpg',
    bio: [
      'Idea Dental is proud to have Dr. Nakul Rathi visiting as a provider. Dr. Rathi has specialized in implants and full mouth rehabilitation, pursuing his interest in dental implants at New York University, College of Dentistry.',
      'He completed his Masters of Science and Advanced Prosthodontics Clinical Residency Program at The Ohio State University, working within a clinic that has completed over 25,000 implants.',
      "Dr. Rathi was selected as the 'New and Emerging Speaker' by the American Dental Association in Washington DC in 2015, and lectures internationally on implant dentistry and CAD-CAM in dentistry.",
    ],
  },
]

// Real before/after photos from the live site's "Before & After Gallery" page
// — each image already has its own before/after caption burned into the
// photo, so `label` here is only used for the accessible alt text.
export const results = [
  { key: 'traditional-braces-1', label: 'Traditional Braces — 9 months later' },
  { key: 'teeth-whitening', label: 'Teeth Whitening — 1 week later' },
  { key: 'traditional-braces-2', label: 'Traditional Braces — 1 week later' },
  { key: 'teeth-cleaning', label: 'Teeth Cleaning' },
  { key: 'cosmetic-bonding', label: 'Cosmetic Bonding' },
  { key: 'dentures', label: 'Dentures' },
  { key: 'traditional-braces-3', label: 'Traditional Braces — 4 months later' },
  { key: 'fillings', label: 'Fillings' },
  { key: 'implants', label: 'Implants' },
]

// `quote` is the full, unedited review. `headline` + `body` are that same
// review split into a pull-quote sentence and the remaining sentences (no
// words added or changed) for the split hero-line/body-copy testimonial
// layout. `treatment` + `resultKey` pair each real review with one of the
// real before/after photos from `results` above for the split-image card;
// the reviews themselves don't name a procedure, so this pairing is an
// editorial choice, not a claim from the patient.
export const testimonials = [
  {
    name: 'Dawn W.',
    quote:
      'Had a problem come up in between appointments, and they said come on in and took care of it. Exceptional customer service!',
    headline: 'Exceptional customer service!',
    body: 'Had a problem come up in between appointments, and they said come on in and took care of it.',
    treatment: 'Teeth Cleaning',
    resultKey: 'teeth-cleaning',
  },
  {
    name: 'Tommy H.',
    quote:
      'I got my braces and implant done here. The doctors and staff were really very nice and the price was half of what other dentists quoted me. I recommend this dental office!!!',
    headline: 'I recommend this dental office!!!',
    body: 'I got my braces and implant done here. The doctors and staff were really very nice and the price was half of what other dentists quoted me.',
    treatment: 'Implants',
    resultKey: 'implants',
  },
  {
    name: 'Thuy B.',
    quote:
      'Great experience!!!! Staffs are extremely friendly and professional. I would highly recommend this dental office.',
    headline: 'Great experience!!!!',
    body: 'Staffs are extremely friendly and professional. I would highly recommend this dental office.',
    treatment: 'Cosmetic Bonding',
    resultKey: 'cosmetic-bonding',
  },
  {
    name: 'Jahoward H.',
    quote:
      'The absolute best. The staff was warm and caring, the facility was perfect and the accommodations were nice.',
    headline: 'The absolute best.',
    body: 'The staff was warm and caring, the facility was perfect and the accommodations were nice.',
    treatment: 'Dentures',
    resultKey: 'dentures',
  },
]

// There's no FAQ page on the live site — these questions were chosen to
// surface real, already-published facts in FAQ form, not to introduce new
// claims. Answers are condensed from the source pages (general-dentistry,
// cosmetic-dentistry, orthodontic-services, restorative-dentistry, about,
// contact, appointments, new-patients, meet-our-doctors), keeping every fact
// as stated there. Two things found on the real site were deliberately left
// out: the "specials" page (free/promo offers, excluded per the brief) and a
// pricing-comparison table in new-patients that's HTML-commented out and
// doesn't actually render on the live page.
export const faqs = [
  // General
  {
    category: 'General',
    question: 'What are your office hours?',
    answer:
      "Tuesday and Wednesday, 10am–6pm, for general dentistry and walk-ins. Thursday, 11am–4pm, for braces adjustments and surgery. Monday, 10am–4pm, for surgeries only. Saturday is by appointment; we're closed Friday and Sunday.",
  },
  {
    category: 'General',
    question: 'Where is Idea Dental located?',
    answer: "We're at 216 W Little York Road, Suite B, Houston, TX 77076.",
  },
  {
    category: 'General',
    question: 'Can I walk in without an appointment?',
    answer:
      "Yes — Tuesday and Wednesday are open to walk-ins for general dentistry. Monday, Thursday, and Saturday are appointment-based (surgery, braces adjustments, and by-appointment hours).",
  },
  {
    category: 'General',
    question: 'Do you accept my insurance?',
    answer:
      'We accept all insurance plans and offer flexible payment options, including payment plans for orthodontic treatment, to keep care affordable.',
  },
  {
    category: 'General',
    question: 'How do I request an appointment?',
    answer:
      "Fill out our appointment request form with general information only — please don't include personal health details there. A member of our staff will call to confirm your appointment.",
  },
  {
    category: 'General',
    question: 'How will my appointment be confirmed?',
    answer:
      "We don't confirm instantly online — after you submit a request with your preferred date and time, a staff member calls you to confirm it.",
  },
  {
    category: 'General',
    question: 'What should I expect at my first visit?',
    answer:
      "We'll assess your oral health and build a dental plan based on your individual needs. We see your first visit as the start of a long-term relationship, not a one-off appointment.",
  },
  {
    category: 'General',
    question: 'Do you treat dental emergencies?',
    answer:
      'Yes — alongside general, cosmetic, and orthodontic care, our Houston clinic provides emergency dental care for patients of all ages.',
  },
  {
    category: 'General',
    question: '¿Hablan español?',
    answer: 'Sí — hablamos español. Our team is glad to assist Spanish-speaking patients throughout their visit.',
  },
  {
    category: 'General',
    question: 'Can I text the office instead of calling?',
    answer: 'Yes — every page of our site has a Call or Text option, so you can reach us at (832) 664-8640 either way.',
  },
  {
    category: 'General',
    question: 'Where can I read reviews of Idea Dental?',
    answer: 'You can find us on Google, Facebook, and Yelp — just search "Idea Dental" or use the links on our site.',
  },
  {
    category: 'General',
    question: 'Do you treat the whole family?',
    answer: "Yes — we offer a full range of dental services so all of your family's needs are met under one roof.",
  },
  // General Dentistry
  {
    category: 'General Dentistry',
    question: 'What does general dentistry focus on?',
    answer:
      "Prevention — we'd rather catch a problem early with minor, preventive care than treat something more intensive that wasn't managed in time.",
  },
  {
    category: 'General Dentistry',
    question: 'What is a root canal, and how do I know if I need one?',
    answer:
      'Root canals treat decay that has spread to the pulp inside a tooth. Because the pulp contains nerves, this usually causes real pain, along with signs like bleeding, swelling, or bad breath — even though you may not see damage from the outside.',
  },
  {
    category: 'General Dentistry',
    question: 'How does teeth whitening work?',
    answer:
      "It's a simple, quick treatment that lightens the shade of teeth stained by things like coffee and wine — and the process also removes plaque and tartar that can otherwise lead to dental problems.",
  },
  // Cosmetic Dentistry
  {
    category: 'Cosmetic Dentistry',
    question: 'What are porcelain veneers?',
    answer:
      "Thin, custom-made, tooth-colored shells bonded to the front of your teeth to change their color, shape, size, or length — a good option for discoloration whitening can't fix, or teeth you're unhappy with the look of.",
  },
  {
    category: 'Cosmetic Dentistry',
    question: 'What are dentures, and how do I care for them?',
    answer:
      "Dentures are custom-fitted to your mouth for comfort and function if you're missing teeth. We'll walk you through at-home care afterward and recommend periodic follow-up cleanings.",
  },
  {
    category: 'Cosmetic Dentistry',
    question: 'What is Invisalign?',
    answer:
      'A modern, wire-free way to straighten teeth using a series of custom clear plastic trays that gradually move your teeth into place.',
  },
  // Orthodontics
  {
    category: 'Orthodontics',
    question: 'What are traditional braces like?',
    answer:
      'Stainless steel brackets and archwires that move your teeth into position — and yes, you can pick new colored rubber bands at every adjustment.',
  },
  {
    category: 'Orthodontics',
    question: 'What are clear braces, and are they worth it?',
    answer:
      'They work like metal braces but are far less noticeable. They cost more than traditional braces (though we offer payment plans for all patients), and can discolor from coffee, tea, wine, or smoking.',
  },
  {
    category: 'Orthodontics',
    question: 'How is Invisalign different from regular braces?',
    answer:
      "The aligners are removable, so you can brush and floss normally, and they're clear enough that most people won't notice you're wearing them at all.",
  },
  {
    category: 'Orthodontics',
    question: 'What is Invisalign Teen, and how long do teens wear it?',
    answer:
      'It uses the same clear-aligner approach, but needs to be worn at least 22 hours a day to work properly — teens can remove them to eat, but need to brush both their teeth and the aligners.',
  },
  {
    category: 'Orthodontics',
    question: 'What happens after my braces come off?',
    answer:
      "You move into retention — wearing a retainer as recommended by your dentist (some only at night, others nearly all the time) so your teeth stay put in their new position.",
  },
  {
    category: 'Orthodontics',
    question: 'What is the iTero 3D scanner?',
    answer:
      'A digital scanner that images your smile without needing physical impressions — comfortable enough that you can breathe normally throughout, and it can preview your potential Invisalign results.',
  },
  {
    category: 'Orthodontics',
    question: 'When should my child first see an orthodontist?',
    answer:
      'The American Association of Orthodontics recommends a visit as soon as your dentist notices a possible problem, or by age seven at the latest — even if we just keep watching for now, we can start treatment right away if something comes up.',
  },
  {
    category: 'Orthodontics',
    question: 'Is it too late to get braces as an adult?',
    answer:
      "Not at all — braces aren't just for children, and treating a crooked bite at any age can help prevent problems like gum disease and tartar buildup.",
  },
  {
    category: 'Orthodontics',
    question: 'How long will I need to wear braces?',
    answer:
      'It depends on how early the problem is caught, what needs fixing, how your teeth respond, and how closely you follow your treatment plan.',
  },
  // Restorative Dentistry
  {
    category: 'Restorative Dentistry',
    question: 'What does restorative dentistry cover?',
    answer:
      'A full range of repair and replacement options — we recommend ongoing check-ups to monitor your gums and bone density around any restorative work.',
  },
  {
    category: 'Restorative Dentistry',
    question: 'What are dental implants, and how do they compare to dentures?',
    answer:
      'Unlike removable dentures, dental implants are a permanent replacement that restores both function and appearance — often a more lasting solution for missing teeth.',
  },
  // Our Doctors
  {
    category: 'Our Doctors',
    question: 'Who will be treating me?',
    answer: 'Our team includes Dr. Stephanie Vu and Dr. Nakul Rathi, alongside a full clinical staff.',
  },
  {
    category: 'Our Doctors',
    question: "What is Dr. Vu's background?",
    answer:
      'She earned her biology degree from the University of Texas at Austin, then her Doctor of Dental Surgery from the University of Texas School of Dentistry at Houston, graduating with honors and winning the Student Achievement Award in Endodontics.',
  },
  {
    category: 'Our Doctors',
    question: 'What inspired Dr. Vu to become a dentist?',
    answer:
      'She discovered her passion for dentistry while volunteering at the San Jose Clinic in Houston during college, which led her to pursue her dental degree.',
  },
  {
    category: 'Our Doctors',
    question: "What is Dr. Rathi's specialty?",
    answer: 'Dental implants and full mouth rehabilitation.',
  },
  {
    category: 'Our Doctors',
    question: 'What training does Dr. Rathi have in implants?',
    answer:
      "He pursued implant dentistry at NYU College of Dentistry, then completed a Master of Science and Advanced Prosthodontics Clinical Residency at Ohio State University — one of the country's oldest implant training programs.",
  },
  {
    category: 'Our Doctors',
    question: 'Has Dr. Rathi been recognized professionally?',
    answer:
      'Yes — the American Dental Association selected him as a "New and Emerging Speaker" in 2015, and he continues to lecture on implant dentistry and CAD-CAM technology at dental organizations nationally and internationally.',
  },
]

export const features = [
  {
    title: 'iTero digital scanning',
    description:
      'Precise 3D imaging of your smile in place of traditional impressions — used across our orthodontic treatment planning.',
  },
  {
    title: 'Piezotome technology',
    description: 'Modern equipment used to support gentler, more controlled extraction procedures.',
  },
  {
    title: 'Bilingual care',
    description: 'Hablamos Español — our team provides care in both English and Spanish.',
  },
  {
    title: 'Comfort-focused rooms',
    description: 'Every patient room is equipped with a 75″ TV to help you relax during treatment.',
  },
  {
    title: 'Insurance & payment plans',
    description: 'We accept all insurance plans and offer flexible payment options for every patient.',
  },
]

// Real content from the live site's "WE HAVE THE NEWEST TECHNOLOGY!" section
// (two YouTube embeds, no additional copy beyond the titles) — descriptions
// below reuse the matching blurbs already sourced for `features` above.
export const technology = [
  {
    title: 'iTero Element Scanner',
    description:
      'Precise 3D imaging of your smile in place of traditional impressions — used across our orthodontic treatment planning.',
    youtubeId: 'cby3c8VHLgM',
  },
  {
    title: 'Piezotome Cube Extraction',
    description: 'Modern equipment used to support gentler, more controlled extraction procedures.',
    youtubeId: 'dyivqeElRVg',
  },
]

export const aboutCopy = {
  intro:
    'Idea Dental is a leading provider of general, cosmetic, restorative, and orthodontic services with a clinic conveniently located in Houston, Texas, treating patients of all ages.',
  philosophy:
    'The team at Idea Dental approaches dentistry with a patient-first philosophy. The friendly staff creates a warm and welcoming environment that puts patients at ease from the moment they call to book their appointment until they leave the practice’s offices.',
  full: [
    'Here at Idea Dental, we believe that a smile tells a thousand words, and we are dedicated to giving our patients high-quality dental care. We offer a full range of dental services, so all of your family’s needs are met under one roof.',
    'Our goal is for you to leave our office with a memorable and enjoyable dental experience, which is why our welcoming and compassionate staff will do everything they can to make you feel right at home.',
  ],
}

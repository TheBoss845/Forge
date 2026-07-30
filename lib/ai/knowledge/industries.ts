import type { IndustryPlaybook } from "@/lib/ai/knowledge/types";

/**
 * Industry playbooks: distilled consulting experience for every industry
 * Forge onboarding offers. Each playbook is written to be directly useful
 * inside a prompt — concrete, specific, and free of filler.
 */
export const INDUSTRY_PLAYBOOKS: IndustryPlaybook[] = [
  {
    industry: "Medical & dental",
    aliases: [
      "clinic",
      "doctor",
      "dentist",
      "dental",
      "medical",
      "patient",
      "orthodont",
      "physician",
      "chiropract",
      "therapy",
      "therapist",
    ],
    commonUsers: [
      "Patients booking and managing their own visits",
      "Front-desk staff running the daily schedule and phones",
      "Providers (doctors/dentists/hygienists) reviewing their day",
      "An office manager watching utilization and no-shows",
    ],
    typicalSystems: [
      "Online appointment booking with provider and room constraints",
      "Recall/reminder systems (cleanings every 6 months, follow-ups)",
      "New-patient intake forms filled before arrival",
      "Insurance information capture (capture only — verification is usually external)",
    ],
    keyEntities: [
      "Patient (name, date of birth, phone, email, insurance carrier + member ID)",
      "Appointment (patient, provider, appointment type, room/chair, status, duration)",
      "Provider (name, specialty, working hours)",
      "Appointment type (name, duration, which providers can do it)",
    ],
    mustAskQuestions: [
      "Do different visit types take different amounts of time (cleaning vs. root canal)?",
      "Do patients choose their provider, or does the front desk assign one?",
      "What is your no-show policy — reminders, deposits, or a call list?",
      "Do new patients need to fill intake forms before their first visit?",
    ],
    pitfalls: [
      "Treating all appointments as equal-length blocks — real schedules break instantly",
      "Building medical-records features; that is regulated EHR territory, keep scheduling separate from clinical data",
      "Ignoring recall reminders — they drive most repeat revenue for dental",
      "Double-booking rooms/chairs when only provider availability is checked",
    ],
    security: [
      "Health information is sensitive by law (HIPAA in the US): collect the minimum, encrypt at rest, never in analytics or logs",
      "Patients must only ever see their own records and appointments",
      "Staff access should be role-limited; receptionists rarely need clinical notes",
    ],
    successMetrics: [
      "Fewer front-desk phone hours per day",
      "No-show rate reduction (industry loses 10-20% of slots)",
      "Percentage of bookings made outside office hours",
    ],
  },
  {
    industry: "Veterinary",
    aliases: [
      "vet",
      "veterinar",
      "animal",
      "pet",
      "groomer",
      "grooming",
      "kennel",
      "boarding",
    ],
    commonUsers: [
      "Pet owners booking visits and viewing their pets' schedules",
      "Front-desk staff managing the day and phone traffic",
      "Veterinarians and techs reviewing their appointments",
      "A practice manager watching capacity and no-shows",
    ],
    typicalSystems: [
      "Online booking with species/visit-type constraints",
      "Vaccination reminder schedules per pet",
      "Boarding/grooming calendars with capacity limits",
      "Multi-pet households sharing one owner account",
    ],
    keyEntities: [
      "Customer/Owner (name, email, phone) — one owner has many pets",
      "Pet (name, species, breed, date of birth, notes like 'nervous, needs muzzle')",
      "Appointment (pet, service, provider, date/time, status)",
      "Service (exam, vaccination, surgery, grooming — each with duration)",
    ],
    mustAskQuestions: [
      "Can one owner book for several pets in one visit?",
      "Which services can be booked online, and which need a phone call (surgery usually does)?",
      "Do you send vaccination reminders, and how far in advance?",
      "Are drop-off appointments or boarding part of the picture?",
    ],
    pitfalls: [
      "Modeling the pet as the customer — the OWNER is the account, pets are records under it",
      "Letting surgery slots be self-booked online without staff triage",
      "Ignoring species constraints (exotic pets often see specific vets only)",
    ],
    security: [
      "Owners must only see their own pets and visit history",
      "Emergency contact info must be quickly visible to staff, never public",
    ],
    successMetrics: [
      "Bookings made online vs. by phone",
      "Vaccination compliance / recall visit rate",
      "Reduced no-shows from automatic reminders",
    ],
  },
  {
    industry: "Repair & maintenance",
    aliases: [
      "repair",
      "hvac",
      "plumb",
      "electrician",
      "mechanic",
      "auto shop",
      "appliance",
      "handyman",
      "maintenance",
      "garage",
      "tire",
    ],
    commonUsers: [
      "Customers requesting service and checking job status",
      "Dispatchers/owners assigning jobs to technicians",
      "Field technicians updating jobs from their phones",
    ],
    typicalSystems: [
      "Service request intake with photos and problem description",
      "Job tracking board (requested → scheduled → in progress → done → invoiced)",
      "Quote/estimate approval by the customer before work starts",
      "Technician day view optimized for mobile",
    ],
    keyEntities: [
      "Customer (name, phone, address — address matters, techs drive there)",
      "Job (customer, description, status, assigned tech, scheduled window, photos)",
      "Quote (job, line items, total, approved/declined, valid-until date)",
      "Technician (name, skills, working hours)",
    ],
    mustAskQuestions: [
      "Does the customer approve a quote before work begins, and can approval happen online?",
      "Do jobs happen at YOUR shop or at the customer's location (or both)?",
      "What are the real stages a job passes through, in your words?",
      "Do technicians need to update jobs from their phones in the field?",
    ],
    pitfalls: [
      "Skipping the quote-approval step — it is the heart of trust in this trade",
      "Desktop-first design when technicians live on phones in trucks",
      "Modeling one visit per job; real jobs often need parts ordered and a second visit",
    ],
    security: [
      "Customer addresses and gate codes are sensitive — restrict to assigned staff",
      "Price/margin data should be hidden from customer-facing views",
    ],
    successMetrics: [
      "Quote-to-approval time",
      "Jobs completed per tech per day",
      "Fewer 'where is my technician?' phone calls",
    ],
  },
  {
    industry: "Construction",
    aliases: [
      "construction",
      "contractor",
      "builder",
      "roofing",
      "remodel",
      "renovation",
      "landscap",
      "excavat",
      "concrete",
      "painting",
    ],
    commonUsers: [
      "The owner/estimator preparing bids",
      "Project managers tracking active jobs",
      "Crew leads seeing today's site assignments",
      "Clients checking progress and approving changes",
    ],
    typicalSystems: [
      "Bid/estimate pipeline (lead → site visit → bid sent → won/lost)",
      "Project tracking with phases, photos, and daily logs",
      "Change-order approval with client sign-off",
      "Document storage per project (permits, plans, contracts)",
    ],
    keyEntities: [
      "Lead/Client (name, contact, property address, source)",
      "Project (client, address, status, start/end dates, contract value)",
      "Bid (project, line items or lump sum, sent date, status)",
      "Change order (project, description, cost delta, approved by, date)",
    ],
    mustAskQuestions: [
      "Walk me through winning a job: from first call to signed contract, what are the steps?",
      "How do you handle change orders today, and who approves them?",
      "Do clients expect progress photos or updates without calling you?",
      "Are your bids line-item or lump-sum?",
    ],
    pitfalls: [
      "Underestimating change orders — they are where contractors lose money and relationships",
      "Building full accounting; integrate with QuickBooks-style tools instead",
      "Ignoring photo documentation, which resolves most disputes",
    ],
    security: [
      "Contract values and margins visible only to owner/PM roles",
      "Client documents (contracts, permits) need per-project access control",
    ],
    successMetrics: [
      "Bid turnaround time",
      "Change orders captured in writing (vs. verbal)",
      "Fewer client status-update calls",
    ],
  },
  {
    industry: "Restaurants & food",
    aliases: [
      "restaurant",
      "cafe",
      "bakery",
      "catering",
      "food truck",
      "bar",
      "pizzeria",
      "deli",
      "coffee",
    ],
    commonUsers: [
      "Customers reserving tables or placing orders",
      "Host staff managing the floor and waitlist",
      "Kitchen staff seeing incoming orders or prep lists",
      "Managers scheduling shifts and watching sales",
    ],
    typicalSystems: [
      "Table reservations with party size and time slots",
      "Catering/event inquiry and quote pipeline",
      "Staff shift scheduling with swap requests",
      "Simple online ordering for pickup (full delivery is a platform play)",
    ],
    keyEntities: [
      "Reservation (name, phone, party size, date/time, table, status, notes like allergies)",
      "Menu item (name, price, category, available flag)",
      "Order (items, customer, pickup time, status, total)",
      "Shift (employee, role, start/end, date)",
    ],
    mustAskQuestions: [
      "Reservations, online ordering, catering, or staff scheduling — which one hurts most today?",
      "How do you handle no-show reservations tonight?",
      "For ordering: pickup only, or is delivery in scope (delivery adds real complexity)?",
    ],
    pitfalls: [
      "Trying to compete with OpenTable/DoorDash on day one — start with the owned channel",
      "Ignoring peak-hour capacity rules (kitchen can only produce so much per 15 minutes)",
      "Complex menu-modifier systems before basic ordering works",
    ],
    security: [
      "Never store card numbers — use a payment provider's checkout",
      "Customer phone lists are a marketing asset; protect and don't over-collect",
    ],
    successMetrics: [
      "No-show rate on reservations",
      "Online orders per week without phone time",
      "Hours saved building the weekly schedule",
    ],
  },
  {
    industry: "Property management",
    aliases: [
      "property",
      "landlord",
      "tenant",
      "rental",
      "hoa",
      "apartment",
      "lease",
      "real estate management",
    ],
    commonUsers: [
      "Tenants submitting maintenance requests and paying rent",
      "Property managers triaging requests and tracking units",
      "Maintenance staff/vendors working assigned tickets",
      "Owners viewing reports on their properties",
    ],
    typicalSystems: [
      "Maintenance request portal with photos and urgency levels",
      "Unit/lease tracking with key dates (lease end, renewals)",
      "Announcements to buildings or units",
      "Rent-payment tracking (payment itself usually via a provider)",
    ],
    keyEntities: [
      "Property (address, units count, owner)",
      "Unit (property, number, bedrooms, current lease)",
      "Lease (unit, tenant, start/end, rent amount, status)",
      "Maintenance request (unit, tenant, description, urgency, photos, status, assigned to)",
    ],
    mustAskQuestions: [
      "How do tenants report problems today, and what gets lost in that process?",
      "Who does the repair work: your staff or outside vendors?",
      "What are your urgency levels (flooding at 2am vs. dripping faucet)?",
      "Do owners of the properties expect their own reporting view?",
    ],
    pitfalls: [
      "Building rent-payment processing from scratch — link out to a payment provider",
      "One flat request queue with no urgency triage",
      "Forgetting vendors need limited access to only their assigned tickets",
    ],
    security: [
      "Tenant contact info restricted from other tenants; unit access codes tightly controlled",
      "Vendors see only their assigned requests, never the tenant directory",
    ],
    successMetrics: [
      "Time from request to resolution",
      "Requests handled without phone calls",
      "Lease renewals not missed",
    ],
  },
  {
    industry: "Retail",
    aliases: [
      "retail",
      "store",
      "shop",
      "boutique",
      "inventory",
      "stock",
      "merchandise",
      "pos",
    ],
    commonUsers: [
      "Owners/managers watching stock and sales across locations",
      "Floor staff checking stock and receiving deliveries",
      "Buyers deciding what to reorder",
    ],
    typicalSystems: [
      "Inventory tracking across locations with low-stock alerts",
      "Receiving/adjustment logs (deliveries, damage, shrinkage)",
      "Reorder lists by supplier",
      "Simple sales/stock dashboards",
    ],
    keyEntities: [
      "Product (name, SKU, category, price, cost, reorder point)",
      "Stock level (product, location, quantity)",
      "Stock movement (product, location, change, reason: sale/delivery/adjustment, who, when)",
      "Supplier (name, contact, products supplied, lead time)",
    ],
    mustAskQuestions: [
      "How many locations, and does stock move between them?",
      "What tells you to reorder today — gut feel, spreadsheets, or walking the floor?",
      "Do you have a POS already, and should this system read its sales numbers or track independently?",
      "How do you count and correct stock (cycle counts, annual counts)?",
    ],
    pitfalls: [
      "Building a POS when the ask is inventory visibility — separate concerns",
      "Ignoring stock adjustments/shrinkage; counts drift from reality within weeks",
      "Absolute quantities without movement history — you cannot debug drift without a log",
    ],
    security: [
      "Cost/margin data hidden from floor-staff roles",
      "Stock adjustments need an audit trail of who changed what and why",
    ],
    successMetrics: [
      "Stockouts prevented by low-stock alerts",
      "Time saved on manual counts",
      "Shrinkage visibility",
    ],
  },
  {
    industry: "Manufacturing",
    aliases: [
      "manufactur",
      "factory",
      "production",
      "assembly",
      "fabricat",
      "workshop",
      "machin",
    ],
    commonUsers: [
      "Production managers planning runs and tracking orders",
      "Floor operators logging output and issues",
      "Sales staff checking order status for customers",
    ],
    typicalSystems: [
      "Production order tracking (queued → in production → QC → shipped)",
      "Materials/parts inventory with usage per product",
      "Quality-check logging with pass/fail and reasons",
      "Simple capacity view of the week",
    ],
    keyEntities: [
      "Product (name, SKU, materials used per unit)",
      "Production order (product, quantity, customer, due date, status)",
      "Material (name, unit, quantity on hand, reorder point, supplier)",
      "QC record (order, checkpoint, pass/fail, notes, inspector)",
    ],
    mustAskQuestions: [
      "Make-to-order or make-to-stock (or both)?",
      "What are the actual stages a production order passes through on your floor?",
      "Where do delays come from most: materials, machine capacity, or people?",
      "What does QC look like — one final check or checks at stations?",
    ],
    pitfalls: [
      "Trying to be a full ERP/MRP on day one — track orders and materials first",
      "Ignoring scrap/rework, which quietly eats margins",
      "Scheduling to theoretical capacity instead of demonstrated throughput",
    ],
    security: [
      "Customer pricing and costs restricted to office roles",
      "Floor terminals should use simple shared-station flows with per-action attribution",
    ],
    successMetrics: [
      "On-time delivery rate",
      "Material stockouts that halted production",
      "Order status answered without walking the floor",
    ],
  },
  {
    industry: "Education",
    aliases: [
      "school",
      "tutor",
      "course",
      "training",
      "academy",
      "teacher",
      "student",
      "class",
      "lesson",
      "education",
    ],
    commonUsers: [
      "Students (or parents) enrolling and viewing schedules",
      "Teachers/instructors managing their classes and attendance",
      "Administrators handling enrollment and communication",
    ],
    typicalSystems: [
      "Class/course catalog with schedules and capacity",
      "Enrollment with waitlists",
      "Attendance tracking",
      "Parent/student announcements and messaging",
    ],
    keyEntities: [
      "Student (name, contact, guardian contact if minor)",
      "Class/Course (name, instructor, schedule, capacity, price)",
      "Enrollment (student, class, status: enrolled/waitlisted/dropped, date)",
      "Attendance record (enrollment, session date, present/absent/late)",
    ],
    mustAskQuestions: [
      "Are students minors — do parents act on their behalf (that changes accounts and consent)?",
      "Do classes have capacity limits and waitlists?",
      "One-off classes, recurring semesters, or rolling enrollment?",
      "Is payment per class, per term, or subscription?",
    ],
    pitfalls: [
      "Ignoring the guardian/minor relationship in accounts",
      "Building a full LMS (content, quizzes, grades) when the ask is scheduling and enrollment",
      "No waitlist handling — popular classes churn manual work",
    ],
    security: [
      "Children's data has extra legal protection (COPPA/FERPA-type rules): minimum collection, guardian consent",
      "Class rosters visible to instructors of that class only",
    ],
    successMetrics: [
      "Enrollment completed without office phone calls",
      "Fill rate of classes / waitlist conversions",
      "Attendance capture rate",
    ],
  },
  {
    industry: "Nonprofit",
    aliases: [
      "nonprofit",
      "charity",
      "volunteer",
      "donor",
      "donation",
      "ngo",
      "foundation",
      "community",
    ],
    commonUsers: [
      "Volunteers signing up for shifts and events",
      "Coordinators scheduling and communicating with volunteers",
      "Donors giving and receiving receipts (payment via a provider)",
      "Directors reporting to the board",
    ],
    typicalSystems: [
      "Volunteer shift scheduling with sign-ups and reminders",
      "Event management with registration",
      "Donor/donation tracking (CRM-lite)",
      "Impact reporting (hours volunteered, people served)",
    ],
    keyEntities: [
      "Volunteer (name, contact, skills, availability, background-check status if relevant)",
      "Shift/Event (name, date/time, location, capacity, signed-up volunteers)",
      "Donor (name, contact, giving history)",
      "Donation (donor, amount, date, campaign, receipt sent)",
    ],
    mustAskQuestions: [
      "Which hurts more: coordinating volunteers or tracking donors?",
      "Do volunteers need background checks or training before certain shifts?",
      "Do you need year-end giving statements for donors?",
      "Who on staff will actually maintain this data (nonprofits run lean)?",
    ],
    pitfalls: [
      "Building donation payment processing — use a provider, track results",
      "Over-complex volunteer skill matching before basic sign-ups work",
      "Ignoring the reality that data upkeep falls on one overworked coordinator",
    ],
    security: [
      "Donor giving history is confidential — tight role limits",
      "Volunteer background-check status: store the status, never the documents",
    ],
    successMetrics: [
      "Shift fill rate without phone chains",
      "Volunteer retention",
      "Donor retention and receipt automation",
    ],
  },
  {
    industry: "Consulting",
    aliases: [
      "consult",
      "agency",
      "freelanc",
      "advisory",
      "professional services",
      "studio",
    ],
    commonUsers: [
      "Clients checking project status and sharing documents",
      "Consultants tracking engagements and deliverables",
      "Principals watching utilization and pipeline",
    ],
    typicalSystems: [
      "Client portal (status, deliverables, shared files, messages)",
      "Engagement/project tracking with milestones",
      "Proposal pipeline (lead → proposal → won/lost)",
      "Time tracking against engagements (if they bill hourly)",
    ],
    keyEntities: [
      "Client (company, contacts, status)",
      "Engagement/Project (client, scope summary, milestones, status, value)",
      "Deliverable (engagement, name, due date, status, file link)",
      "Time entry (person, engagement, date, hours, note) — only if hourly",
    ],
    mustAskQuestions: [
      "Do you bill hourly, fixed-fee, or retainer (this decides whether time tracking matters)?",
      "What do clients email you asking about most — that belongs in the portal",
      "How do you share deliverables today, and what goes wrong?",
    ],
    pitfalls: [
      "Building time tracking for a fixed-fee firm that doesn't need it",
      "A portal clients won't log into — it must beat email or it dies",
      "Mixing internal notes and client-visible content in one place without clear separation",
    ],
    security: [
      "Client A must never glimpse client B (data isolation per client)",
      "Internal margins/notes clearly separated from client-visible fields",
    ],
    successMetrics: [
      "Fewer status-update emails",
      "Proposal turnaround time",
      "On-time deliverable rate",
    ],
  },
  {
    industry: "Fitness & wellness",
    aliases: [
      "gym",
      "fitness",
      "yoga",
      "pilates",
      "spa",
      "massage",
      "salon",
      "wellness",
      "trainer",
      "studio",
      "barber",
    ],
    commonUsers: [
      "Members/clients booking classes or sessions",
      "Instructors/practitioners seeing their day",
      "Front desk managing check-ins and walk-ins",
      "Owners watching membership and attendance",
    ],
    typicalSystems: [
      "Class schedules with capacity and waitlists",
      "1-on-1 session booking (trainer/therapist availability)",
      "Membership or class-pack tracking (credits remaining)",
      "Check-in flow at the door",
    ],
    keyEntities: [
      "Member/Client (name, contact, membership or credits, waiver signed)",
      "Class (name, instructor, date/time, capacity, booked count)",
      "Booking (member, class or session, status, checked-in)",
      "Membership/Pack (member, type, credits or period, expiry)",
    ],
    mustAskQuestions: [
      "Classes, 1-on-1 sessions, or both?",
      "How do people pay: memberships, class packs, drop-ins?",
      "What's your late-cancel/no-show policy — lose the credit, fee, or grace?",
      "Do you need waivers signed before first attendance?",
    ],
    pitfalls: [
      "Ignoring the cancellation-policy rules — this is where studios bleed money",
      "No waitlist auto-promotion when someone cancels",
      "Building payment processing instead of tracking entitlements against a provider",
    ],
    security: [
      "Health notes (injuries, conditions) are sensitive — collect minimally, restrict to practitioners",
      "Members see only their own bookings and credits",
    ],
    successMetrics: [
      "Class fill rate",
      "Late-cancel/no-show reduction",
      "Bookings made without front-desk involvement",
    ],
  },
  {
    industry: "Legal",
    aliases: [
      "law",
      "legal",
      "attorney",
      "lawyer",
      "paralegal",
      "firm",
      "case",
      "litigation",
      "notary",
    ],
    commonUsers: [
      "Clients checking case status and sharing documents securely",
      "Attorneys managing matters and deadlines",
      "Paralegals preparing documents and tracking tasks",
      "Office admin handling intake and billing questions",
    ],
    typicalSystems: [
      "Client intake (conflict-check questions, matter details)",
      "Matter/case tracking with key dates and deadlines",
      "Secure document exchange per matter",
      "Client portal for status (reduces 'any update?' calls)",
    ],
    keyEntities: [
      "Client (name, contact, conflict-check status)",
      "Matter (client, type, status, responsible attorney, key deadlines)",
      "Document (matter, name, uploaded by, date, client-visible flag)",
      "Deadline/Event (matter, description, date, reminder set)",
    ],
    mustAskQuestions: [
      "What types of matters do you handle (each has different stages and deadlines)?",
      "What must clients NEVER see, and what do they call asking about?",
      "How do you track court/filing deadlines today — what happens if one is missed?",
      "Do you need intake conflict checks against existing clients?",
    ],
    pitfalls: [
      "Missing the client-visible vs. internal distinction on any document or note — one leak is catastrophic",
      "Building billing/trust accounting — heavily regulated, integrate instead",
      "Deadline tracking without redundancy; missed deadlines are malpractice",
    ],
    security: [
      "Privilege is absolute: per-matter access, attorney-client only, full audit trail",
      "Documents encrypted, links expiring, no public URLs ever",
      "Even matter EXISTENCE can be confidential",
    ],
    successMetrics: [
      "Fewer status calls per matter",
      "Zero missed deadlines",
      "Intake-to-engagement time",
    ],
  },
  {
    industry: "Accounting & finance",
    aliases: [
      "accounting",
      "accountant",
      "bookkeep",
      "tax",
      "cpa",
      "payroll",
      "audit",
      "financial advisor",
    ],
    commonUsers: [
      "Clients uploading documents and answering requests",
      "Accountants tracking engagements and missing items",
      "Partners watching workload across the season",
    ],
    typicalSystems: [
      "Document collection portal with per-client checklists ('we still need your W-2')",
      "Engagement tracking by type and deadline (tax season boards)",
      "Secure messaging about sensitive documents",
      "Recurring engagement scheduling (monthly bookkeeping, quarterly filings)",
    ],
    keyEntities: [
      "Client (name/business, contacts, engagement types)",
      "Engagement (client, type, tax year/period, status, deadline, assigned to)",
      "Document request (engagement, item name, status: requested/received/reviewed)",
      "Document (request, file, uploaded date, reviewed flag)",
    ],
    mustAskQuestions: [
      "Where does time go in busy season — chasing documents, the work itself, or review bottlenecks?",
      "What does a document checklist look like for your most common engagement?",
      "Are deadlines mostly statutory (tax dates) or negotiated?",
    ],
    pitfalls: [
      "Email attachments as the fallback — the portal must be easier than email or it fails",
      "Building tax/accounting computation — the workflow around the work is the product",
      "No checklist status visibility, which is the #1 client friction",
    ],
    security: [
      "Tax documents are identity-theft gold: encryption, expiring links, strict client isolation",
      "Never send document contents through email notifications — send 'you have a new request' only",
    ],
    successMetrics: [
      "Days from request to complete documents",
      "Engagements delivered before deadline",
      "Fewer chasing emails per client",
    ],
  },
  {
    industry: "Real estate",
    aliases: [
      "real estate",
      "realtor",
      "broker",
      "listing",
      "showing",
      "buyer",
      "seller",
      "mls",
      "agent",
    ],
    commonUsers: [
      "Agents managing leads, listings, and showings",
      "Buyers/sellers checking status of their transaction",
      "A team lead/broker watching the pipeline",
    ],
    typicalSystems: [
      "Lead pipeline (new → contacted → touring → offer → closed)",
      "Transaction checklists (inspection, financing, closing dates)",
      "Showing scheduling with feedback capture",
      "Client portal for 'where are we?' during a transaction",
    ],
    keyEntities: [
      "Lead/Client (name, contact, buying/selling, price range, area, source)",
      "Property/Listing (address, price, status, photos link)",
      "Transaction (client, property, key dates, checklist items, status)",
      "Showing (property, client, date/time, feedback)",
    ],
    mustAskQuestions: [
      "Solo agent or team — who follows up on which leads?",
      "Where do leads come from, and which source actually closes?",
      "What are the checkpoint dates in a typical transaction here?",
      "What do clients call about most between contract and closing?",
    ],
    pitfalls: [
      "Rebuilding the MLS — track your pipeline, link to listings",
      "Lead leakage from no follow-up reminders (speed-to-lead decides winners)",
      "One-size checklist across very different transaction types",
    ],
    security: [
      "Client financial qualification details tightly restricted",
      "One client's transaction never visible to another",
    ],
    successMetrics: [
      "Lead response time",
      "Leads converted to appointments",
      "On-time transaction milestones",
    ],
  },
  {
    industry: "Other",
    aliases: [],
    commonUsers: [
      "Customers interacting with the business from outside",
      "Staff doing the daily work inside",
      "An owner/manager needing visibility",
    ],
    typicalSystems: [
      "Whatever replaces the current spreadsheet + phone + notebook combination",
      "A shared, single source of truth for the core records",
      "Status tracking so questions answer themselves",
    ],
    keyEntities: [
      "The customer, in whatever form they take",
      "The core unit of work (job, order, request, case, booking)",
      "The people doing the work",
    ],
    mustAskQuestions: [
      "Walk me through yesterday: where did time or money leak?",
      "What is the 'thing' your business revolves around — a job, an order, a visit?",
      "Who touches that thing, in what order, and where does it stall?",
    ],
    pitfalls: [
      "Assuming a generic template fits — the interview matters double here",
      "Modeling the aspiration instead of the actual current process",
    ],
    security: [
      "Customer data isolated per account; staff roles limited to their function",
    ],
    successMetrics: [
      "Time recovered from manual coordination",
      "Questions answered without interrupting anyone",
    ],
  },
];

export function findIndustryPlaybook(
  industry: string | null | undefined,
  freeText: string,
): IndustryPlaybook {
  const normalized = (industry ?? "").trim().toLowerCase();
  const text = freeText.toLowerCase();

  const byName = INDUSTRY_PLAYBOOKS.find(
    (playbook) => playbook.industry.toLowerCase() === normalized,
  );
  if (byName && byName.industry !== "Other") return byName;

  // Score by number of alias hits so "yoga studio" prefers Fitness &
  // wellness (yoga + studio) over Consulting (studio).
  let bestAliasMatch: IndustryPlaybook | null = null;
  let bestScore = 0;
  for (const playbook of INDUSTRY_PLAYBOOKS) {
    const score = playbook.aliases.reduce(
      (total, alias) =>
        total + (normalized.includes(alias) || text.includes(alias) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestAliasMatch = playbook;
    }
  }
  if (bestAliasMatch) return bestAliasMatch;

  return (
    byName ??
    INDUSTRY_PLAYBOOKS.find((playbook) => playbook.industry === "Other")!
  );
}

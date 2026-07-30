import type { AppPattern } from "@/lib/ai/knowledge/types";

/**
 * Application-type patterns: the recurring shapes of small-business
 * software, distilled. The selector matches these against the owner's
 * request and interview so the AI designs from experience, not from scratch.
 */
export const APP_PATTERNS: AppPattern[] = [
  {
    id: "booking",
    name: "Appointment & booking system",
    keywords: [
      "book",
      "booking",
      "appointment",
      "schedule a",
      "reservation",
      "reserve",
      "time slot",
      "calendar",
      "visit",
      "session",
    ],
    essentialFeatures: [
      "Customer-facing booking flow: pick service → pick time from REAL availability → confirm",
      "Staff schedule view (day + week) with statuses (booked, confirmed, arrived, completed, no-show)",
      "Email confirmation immediately after booking",
      "Cancel/reschedule for customers within policy rules",
    ],
    recommendedFeatures: [
      "Automatic reminders (24h before) — the single highest-ROI feature",
      "Waitlist for full slots with auto-promotion",
      "Deposits at booking to cut no-shows",
    ],
    dataModels: [
      "Service (name, duration, price, who can perform it)",
      "Appointment (customer, service, provider, start datetime, status, notes)",
      "Availability rule (provider, weekday, start, end) — availability is COMPUTED from rules minus existing bookings, never stored as free slots",
    ],
    roles: [
      "Customer (book/manage own)",
      "Staff (manage all appointments)",
      "Admin (services, hours, staff)",
    ],
    workflows: [
      "New booking: reserve slot atomically → confirm email → appears on staff schedule → reminder queued",
      "Cancellation: free the slot → notify staff → offer slot to waitlist",
    ],
    pitfalls: [
      "Double-booking race conditions — slot reservation must be atomic",
      "Storing free slots instead of computing them (breaks on schedule changes)",
      "Ignoring timezone handling even for 'local' businesses (DST bites twice a year)",
      "No buffer times between appointments when the business needs cleanup/travel",
    ],
  },
  {
    id: "quoting",
    name: "Quoting & job tracking",
    keywords: [
      "quote",
      "estimate",
      "bid",
      "job",
      "work order",
      "invoice",
      "proposal",
      "project track",
    ],
    essentialFeatures: [
      "Quote builder with line items (description, quantity, unit price) and totals",
      "Send quote to customer with an approve/decline action",
      "Job board with the business's REAL stages",
      "Job detail with history, notes, and photos",
    ],
    recommendedFeatures: [
      "Quote expiry dates and follow-up reminders",
      "Convert approved quote to job in one click",
      "Customer notifications on stage changes",
    ],
    dataModels: [
      "Quote (customer, line items, total, status: draft/sent/approved/declined, valid until)",
      "Quote line item (description, quantity, unit price)",
      "Job (customer, quote, status, assigned to, scheduled date, notes)",
    ],
    roles: [
      "Customer (view/approve own quotes, see job status)",
      "Staff (create quotes, update jobs)",
      "Admin (pricing, reports)",
    ],
    workflows: [
      "Quote approval: customer clicks approve → quote locks → job created → team notified",
      "Job completion: staff mark done → customer notified → ready to invoice",
    ],
    pitfalls: [
      "Editable quotes after approval — approved quotes must be immutable",
      "Skipping DECLINED-quote tracking; decline reasons teach pricing",
      "Stage names invented by the developer instead of the shop's own words",
    ],
  },
  {
    id: "inventory",
    name: "Inventory management",
    keywords: [
      "inventory",
      "stock",
      "warehouse",
      "sku",
      "reorder",
      "supplies",
      "parts",
      "materials",
    ],
    essentialFeatures: [
      "Product catalog with quantities per location",
      "Stock movements (receive, sell/use, adjust, transfer) — every change is a logged movement",
      "Low-stock alerts against reorder points",
      "Search/filter fast enough to use while standing in an aisle",
    ],
    recommendedFeatures: [
      "Reorder suggestions grouped by supplier",
      "Cycle-count mode (count a shelf, reconcile differences)",
      "Movement history per product for debugging drift",
    ],
    dataModels: [
      "Product (name, SKU, category, unit, cost, price, reorder point)",
      "Stock level (product, location, quantity) — derived from movements, cached for speed",
      "Stock movement (product, location, delta, reason, reference, user, timestamp)",
      "Supplier (name, contact, lead time)",
    ],
    roles: [
      "Staff (view, receive, adjust with reason)",
      "Manager (products, reorder points, reports)",
      "Admin (locations, users)",
    ],
    workflows: [
      "Receiving: delivery arrives → scan/enter quantities → movements logged → levels update",
      "Low stock: quantity crosses reorder point → alert → item appears on reorder list",
    ],
    pitfalls: [
      "Storing only current quantity with no movement log — drift becomes undebuggable",
      "Negative-stock states unhandled (they WILL happen; decide the rule)",
      "Requiring a barcode scanner workflow the business doesn't have",
    ],
  },
  {
    id: "crm",
    name: "Lead & customer management (CRM)",
    keywords: [
      "lead",
      "crm",
      "follow up",
      "pipeline",
      "prospect",
      "sales",
      "customer track",
      "deal",
    ],
    essentialFeatures: [
      "Lead capture (manual + a form that can embed on the website)",
      "Pipeline board with the business's real stages",
      "Activity log per lead (calls, emails, meetings, notes)",
      "Follow-up reminders — the feature that actually makes money",
    ],
    recommendedFeatures: [
      "Lead source tracking to learn which marketing works",
      "Assignment rules for teams",
      "Won/lost reasons for pricing and pitch feedback",
    ],
    dataModels: [
      "Lead (name, contact, source, stage, value estimate, assigned to, next follow-up date)",
      "Activity (lead, type: call/email/meeting/note, summary, date, user)",
      "Stage (name, order) — configurable, not hardcoded",
    ],
    roles: [
      "Sales staff (own leads)",
      "Manager (all leads, reassignment, reports)",
    ],
    workflows: [
      "New lead: captured → assigned → first-touch reminder set → stage advances with each activity",
      "Stale lead: no activity in N days → owner nudged",
    ],
    pitfalls: [
      "Complex required fields that make staff stop logging — logging must take seconds",
      "No 'next action' date on every open lead (the pipeline goes stale silently)",
      "Building email sync too early; manual logging with reminders wins for small teams",
    ],
  },
  {
    id: "portal",
    name: "Customer portal",
    keywords: [
      "portal",
      "client login",
      "customer login",
      "client area",
      "share documents",
      "status update",
      "client dashboard",
    ],
    essentialFeatures: [
      "Per-customer login showing THEIR items only (projects, orders, cases, documents)",
      "Status visibility that answers 'where are we?' without a phone call",
      "Document sharing both directions",
      "Notifications when something changes for them",
    ],
    recommendedFeatures: [
      "Simple threaded messages per item (beats email chains)",
      "Approval actions (approve quote, sign-off milestone)",
    ],
    dataModels: [
      "Customer account (contact, linked business records)",
      "Shared item (customer, type, title, status, visible flag)",
      "Document (item, file, uploaded by, client-visible flag)",
      "Message (item, author, body, timestamp)",
    ],
    roles: [
      "Customer (own data only)",
      "Staff (all customers, control visibility)",
      "Admin",
    ],
    workflows: [
      "Status change: staff update → customer notified → portal reflects it → one less phone call",
      "Document request: staff request → customer uploads → staff notified",
    ],
    pitfalls: [
      "The portal must be EASIER than emailing — otherwise adoption dies in a month",
      "Internal notes leaking into client view (every field needs an explicit visibility decision)",
      "Forcing accounts for one-off customers who will never return",
    ],
  },
  {
    id: "documents",
    name: "Document collection & workflows",
    keywords: [
      "document",
      "paperwork",
      "upload",
      "form",
      "intake",
      "checklist",
      "signature",
      "file",
    ],
    essentialFeatures: [
      "Checklists per client/case ('we need: W-2, ID, insurance card')",
      "Upload with automatic status change (requested → received)",
      "Review step (received → reviewed/rejected with a reason)",
      "One dashboard of what's missing across everyone",
    ],
    recommendedFeatures: [
      "Reminder nudges for missing items",
      "Checklist templates per engagement type",
      "Expiring secure links",
    ],
    dataModels: [
      "Request list (client, engagement, items)",
      "Request item (name, status: requested/received/reviewed/rejected, note)",
      "Document (item, file, uploaded date, reviewed by)",
    ],
    roles: [
      "Client (see/upload own items)",
      "Staff (create lists, review)",
      "Admin (templates)",
    ],
    workflows: [
      "Collection: list created → client notified → uploads roll in → staff review → missing items nudged",
    ],
    pitfalls: [
      "Accepting documents by email 'just this once' — the system must be the easiest path",
      "No rejected-with-reason state (blurry photos of documents are universal)",
      "Unlimited file types/sizes accepted (restrict to what's expected)",
    ],
  },
  {
    id: "shifts",
    name: "Staff scheduling & shifts",
    keywords: [
      "shift",
      "roster",
      "staff schedule",
      "employee schedule",
      "availability",
      "swap",
      "timesheet",
      "clock",
    ],
    essentialFeatures: [
      "Weekly schedule builder respecting staff availability",
      "Staff view of their own upcoming shifts (mobile-first)",
      "Shift swap/drop requests with manager approval",
      "Publish + notify when the week is ready",
    ],
    recommendedFeatures: [
      "Availability submission by staff",
      "Open-shift claiming",
      "Hours totals per person per week (overtime awareness)",
    ],
    dataModels: [
      "Employee (name, role, max hours, availability)",
      "Shift (date, start, end, role needed, assigned employee, status)",
      "Swap request (shift, from, to, status, approved by)",
    ],
    roles: [
      "Employee (own shifts, requests)",
      "Manager (build/publish, approve swaps)",
    ],
    workflows: [
      "Weekly publish: draft → checked against availability → published → everyone notified",
      "Swap: request → eligible colleague accepts → manager approves → schedule updates",
    ],
    pitfalls: [
      "Ignoring that staff live on phones — desktop-only schedule views fail",
      "Swaps without approval rules (skills/roles must still match)",
      "No notification on schedule CHANGES after publishing (the #1 complaint)",
    ],
  },
  {
    id: "tickets",
    name: "Support & request tickets",
    keywords: [
      "ticket",
      "support",
      "helpdesk",
      "request",
      "complaint",
      "issue",
      "maintenance request",
    ],
    essentialFeatures: [
      "Submit a request with category, description, photos",
      "Queue with urgency triage and assignment",
      "Status updates visible to the requester",
      "Resolution notes and close-out",
    ],
    recommendedFeatures: [
      "SLA-style aging indicators (nothing sits silently for a week)",
      "Canned responses for the common 80%",
    ],
    dataModels: [
      "Ticket (requester, category, description, urgency, status, assigned to, photos)",
      "Ticket update (ticket, author, note, visibility: requester/internal, timestamp)",
    ],
    roles: [
      "Requester (own tickets)",
      "Agent/staff (assigned queue)",
      "Manager (all, reassign, reports)",
    ],
    workflows: [
      "Lifecycle: submitted → triaged (urgency + assignee) → in progress → resolved → requester confirms",
    ],
    pitfalls: [
      "One flat queue with no urgency levels",
      "Internal notes visible to requesters (visibility must be per-update)",
      "Closing without requester-visible resolution notes (kills trust)",
    ],
  },
  {
    id: "knowledge",
    name: "Internal knowledge assistant",
    keywords: [
      "knowledge",
      "assistant",
      "chatbot",
      "faq",
      "policies",
      "handbook",
      "answers",
      "internal ai",
      "ask questions",
    ],
    essentialFeatures: [
      "Curated knowledge base of the business's documents/policies",
      "Ask-a-question interface that answers FROM those documents",
      "Sources shown with every answer (which document, which section)",
      "Honest 'I don't know — ask a human' when confidence is low",
    ],
    recommendedFeatures: [
      "Unanswered-question log to grow the knowledge base",
      "Per-document access levels (manager-only policies)",
    ],
    dataModels: [
      "Document (title, content, category, access level, updated)",
      "Question log (question, answer given, sources, helpful flag)",
    ],
    roles: ["Employee (ask)", "Manager (curate documents)", "Admin"],
    workflows: [
      "Answering: question → retrieve relevant passages → answer grounded in them, citing sources → log it",
    ],
    pitfalls: [
      "Letting the AI answer beyond the documents — hallucinated policy answers are dangerous",
      "No source citations (trust requires 'according to the handbook, page…')",
      "Stale documents with no ownership for updates",
    ],
  },
  {
    id: "membership",
    name: "Membership & subscriptions",
    keywords: [
      "member",
      "membership",
      "subscription",
      "recurring",
      "plan",
      "renewal",
      "club",
    ],
    essentialFeatures: [
      "Member directory with status (active, lapsed, cancelled)",
      "Plan/entitlement tracking (what each membership includes)",
      "Renewal dates with reminders",
      "Member self-service view of their status",
    ],
    recommendedFeatures: [
      "Usage tracking against entitlements (visits, credits)",
      "Win-back flows for lapsed members",
    ],
    dataModels: [
      "Member (contact, join date, status)",
      "Plan (name, price, period, entitlements)",
      "Membership (member, plan, start, renewal date, status)",
    ],
    roles: ["Member (own status)", "Staff (manage members)", "Admin (plans)"],
    workflows: [
      "Renewal: date approaches → reminder → renewed via payment provider → status updated; lapse handled gracefully",
    ],
    pitfalls: [
      "Building recurring billing yourself — use a provider, track entitlement state",
      "No grace period on failed payments (instant cutoffs create angry members)",
    ],
  },
  {
    id: "events",
    name: "Events & registrations",
    keywords: [
      "event",
      "registration",
      "rsvp",
      "attendee",
      "workshop",
      "conference",
      "signup",
    ],
    essentialFeatures: [
      "Event pages with date, location, capacity",
      "Registration with confirmation email",
      "Attendee list with check-in mode",
      "Capacity limits and waitlists",
    ],
    recommendedFeatures: [
      "Reminder before the event",
      "Post-event follow-up list",
    ],
    dataModels: [
      "Event (name, description, datetime, location, capacity)",
      "Registration (event, attendee name/contact, status: registered/waitlist/attended/no-show)",
    ],
    roles: [
      "Attendee (register, view own)",
      "Organizer (events, check-in, lists)",
    ],
    workflows: [
      "Registration: sign up → confirm email → reminder → check-in at door → attendance recorded",
    ],
    pitfalls: [
      "Ignoring the at-the-door check-in reality (spotty wifi, one person, a line)",
      "No waitlist promotion on cancellations",
    ],
  },
  {
    id: "ordering",
    name: "Orders & fulfillment",
    keywords: [
      "order",
      "ordering",
      "fulfillment",
      "pickup",
      "delivery",
      "wholesale",
      "purchase",
      "checkout",
    ],
    essentialFeatures: [
      "Catalog of orderable items with availability",
      "Order placement with clear pickup/delivery expectations",
      "Order queue for staff with statuses (new → preparing → ready → completed)",
      "Notifications at status changes ('your order is ready')",
    ],
    recommendedFeatures: [
      "Repeat-order shortcuts for regulars",
      "Prep-capacity limits per time window",
    ],
    dataModels: [
      "Item (name, price, category, available)",
      "Order (customer, items with quantities, total, status, ready-by time)",
      "Order line (item, quantity, unit price, note)",
    ],
    roles: [
      "Customer (order, track own)",
      "Staff (queue, statuses)",
      "Manager (catalog, reports)",
    ],
    workflows: [
      "Order: placed → staff accept with ready-by time → preparing → ready (customer notified) → completed",
    ],
    pitfalls: [
      "Unbounded order intake with no capacity throttle (kitchen/warehouse drowning)",
      "Storing card data — always a payment provider's checkout",
      "No 'sold out' switch staff can flip in two seconds",
    ],
  },
];

/** Detects which patterns a free-text request matches, best first. */
export function detectPatterns(freeText: string, limit = 2): AppPattern[] {
  const text = freeText.toLowerCase();
  return APP_PATTERNS.map((pattern) => ({
    pattern,
    score: pattern.keywords.reduce(
      (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
      0,
    ),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.pattern);
}

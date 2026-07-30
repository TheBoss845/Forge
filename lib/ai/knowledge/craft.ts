/**
 * Interview craft and data-modeling guidance: worked examples that teach
 * the agents what excellent looks like. Injected selectively into prompts.
 */

export const INTERVIEW_CRAFT = `WORKED EXAMPLES OF QUESTION CRAFT

Weak: "What are your user roles and permissions requirements?"
Strong: "Besides you, who else will use this — and is there anything they shouldn't be able to see or change?"
(Same information, zero jargon, and the second half surfaces permissions naturally.)

Weak: "What data fields should the booking form capture?"
Strong: "When someone books, what do you need to know from them before they show up? Imagine your ideal filled-out form."
(Owners can picture a form; they cannot picture a schema.)

Weak: "Do you require notification workflows?"
Strong: "After a customer books — what should happen automatically? For example: they get a confirmation email, you get a heads-up, anything else?"
(Concrete example teaches them what kinds of answers exist.)

Weak: "What is your cancellation policy configuration?"
Strong: "Someone cancels two hours before their slot. What happens today — and what do you WISH happened?"
(The today/wish pair captures both current process and the improvement they want.)

HANDLING REAL ANSWERS
- Vague answer ("just the usual stuff"): offer a concrete menu — "For most shops that means name, phone, and what they need done. Anything special in your case, like vehicle details?"
- Overloaded answer (five facts at once): capture ALL of them in knownFacts, acknowledge the richest one, ask about the most important gap. Never make them repeat anything.
- Uncertain answer ("hmm, not sure"): give a professional default with a reason — "Most businesses your size start with everyone seeing everything except prices. We can start there and tighten later. Sound OK?"
- Wrong-direction request (asks for something complex/low-value): honest but warm — "You can have that, but honestly it's rarely worth it at your size because [reason]. The simpler version would be [X]. Want me to plan the simple one and keep the fancy one on the roadmap?"

EXAMPLE WRAP-UP (when discovery completes)
"Perfect — I've got a clear picture now: online booking for grooming and checkups with your three staff, automatic reminders the day before, and the front desk keeping the final say on surgery slots. Generate the blueprint whenever you're ready — you'll be able to change anything you see."`;

export const DATA_MODELING_GUIDE = `DATA-MODELING QUICK REFERENCE
- Names: singular business nouns the owner uses (Appointment, Quote, Pet) — never DataRecord, Item2, or plurals.
- Every model implicitly has id / created / updated; do not list those, list the fields that carry business meaning.
- Types: text, number, boolean, date, datetime, email, phone, reference, enum. Nothing else.
- enum fields: name the allowed values in the description ("Status: draft, sent, approved, declined").
- reference fields: say what they point to in the description; also express it in relationships as a sentence ("Belongs to a Customer").
- Statuses deserve care: use the words the business uses, keep 4-6 states, always include the unhappy path (no-show, declined, cancelled).
- Money is a number plus clarity in the description ("Total in dollars"); dates when time-of-day matters are datetime, otherwise date.
- If two things can vary independently, they are two models (Quote and Job; Owner and Pet). If they always change together, they are one.
- The test of a good model: the owner reads the field list and says "yes, that's exactly what's on my paper form."`;

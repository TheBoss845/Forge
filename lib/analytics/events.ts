/**
 * Internal product-event tracking.
 *
 * For now events are structured server logs; the transport can later be
 * swapped for a real analytics backend without changing call sites.
 * Never pass user content (prompts, messages) as event properties.
 */

export type ProductEvent =
  | "account_created"
  | "onboarding_completed"
  | "project_created"
  | "interview_started"
  | "interview_completed"
  | "blueprint_generated"
  | "blueprint_edited"
  | "blueprint_approved"
  | "generation_started"
  | "generation_completed"
  | "deployment_started"
  | "deployment_completed";

export function trackEvent(
  event: ProductEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  console.info(
    JSON.stringify({
      type: "product_event",
      event,
      ...properties,
      timestamp: new Date().toISOString(),
    }),
  );
}

import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? "",
  {
    appInfo: {
      name: "Learn with AI Subscription Portal",
      version: "0.1.0",
    },
  }
);

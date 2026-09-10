import { auth } from "@/auth";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing-features";
import { LandingCtaFaq } from "@/components/landing-cta-faq";

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  return (
    <>
      <LandingHero />
      <LandingFeatures />
      <LandingCtaFaq isLoggedIn={isLoggedIn} />
    </>
  );
}

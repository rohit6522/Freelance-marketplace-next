import { cache } from "react";
import { notFound } from "next/navigation";
import ProfileTicker from "@/components/profile/ProfileTicker";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTabs from "@/components/profile/ProfileTabs";
import GigsSection from "@/components/profile/GigsSection";
import PortfolioSection from "@/components/profile/PortfolioSection";
import ProfileReviews from "@/components/profile/ProfileReviews";
import WorkHistory from "@/components/profile/WorkHistory";
import { ProfileProvider } from "@/components/profile/ProfileContext";
import { serverGet, serverRequest } from "@/lib/serverApi";

// generateMetadata aur page dono ko ek hi request lagti hai
const loadProfile = cache((id) => serverRequest(`/freelancers/${encodeURIComponent(id)}`, { revalidate: 0 }));

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await loadProfile(id);
  if (!data) return { title: "Freelancer not found" };

  const { user, profile } = data;
  return {
    title: profile?.title ? `${user.name} | ${profile.title}` : user.name,
    description: profile?.bio?.slice(0, 160) || undefined,
  };
}

export default async function FreelancerProfilePage({ params }) {
  const { id } = await params;
  const { status, data } = await loadProfile(id);

  if (status === 404 || status === 400) notFound();
  if (!data) throw new Error("We could not load this profile right now. Please try again in a moment.");

  const { user, gigs = [], portfolio = [], stats } = data;
  const profile = data.profile ?? {};

  const [reviewsRes, platform] = await Promise.all([
    serverRequest(`/reviews?freelancer=${user._id}&limit=5`, { revalidate: 0 }),
    serverGet("/stats/public", { revalidate: 60 }),
  ]);

  const shortId = `V-${String(user._id).slice(-5).toUpperCase()}`;
  const reviewCount = reviewsRes.data?.summary?.count ?? profile.ratingCount ?? 0;

  return (
    <ProfileProvider
      freelancer={{ id: user._id, name: user.name }}
      gigs={gigs.map((gig) => ({ id: gig._id, title: gig.title }))}
    >
      <div className="flex flex-col w-full">
        <ProfileTicker shortId={shortId} profile={profile} />
        <ProfileHero user={user} profile={profile} stats={stats} shortId={shortId} />

        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <ProfileSidebar
              user={user}
              profile={profile}
              stats={stats}
              gigs={gigs}
              platformRating={platform?.marketplace?.averageRating ?? 0}
            />

            <div className="lg:col-span-8 flex flex-col space-y-space-xl">
              <ProfileTabs counts={{ gigs: gigs.length, portfolio: portfolio.length, reviews: reviewCount }} />
              <GigsSection gigs={gigs} />
              <PortfolioSection projects={portfolio} />
              <ProfileReviews freelancerId={user._id} sellerName={user.name} initial={reviewsRes.data} />
              <WorkHistory entries={profile.workHistory} experienceYears={profile.experienceYears} />
            </div>
          </div>
        </div>
      </div>
    </ProfileProvider>
  );
}
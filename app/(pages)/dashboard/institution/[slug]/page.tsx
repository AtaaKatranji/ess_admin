import InstitutionDashboard from "@/app/components/InstitutionDashboard";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const safeSlug = Array.isArray(slug) ? slug[0] : slug;
  return <InstitutionDashboard activeSection="overview" slug={safeSlug} />;
  }
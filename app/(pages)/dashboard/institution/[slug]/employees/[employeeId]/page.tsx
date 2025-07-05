// [employeeId]/page.tsx
import { redirect } from 'next/navigation';

export default function Page({ params }: { params: { slug: string; employeeId: string } }) {
  const { slug, employeeId } = params;
  redirect(`/dashboard/institution/${slug}/employees/${employeeId}/details`);
}

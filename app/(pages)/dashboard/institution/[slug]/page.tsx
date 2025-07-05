import { useParams } from 'next/navigation';
import InstitutionDashboard from '@/app/components/InstitutionDashboard';

export default function Page() {
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  return <InstitutionDashboard activeSection={section as string} />;
}

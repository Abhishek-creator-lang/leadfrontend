import { redirect } from 'next/navigation';
import { PATHS } from '@/routes/paths';

// Unknown URLs go to the dashboard, as the old catch-all route did.
export default function NotFound() {
  redirect(PATHS.dashboard);
}

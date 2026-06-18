import { redirect } from 'next/navigation';

// Project settings now live in a modal opened from the board's gear icon.
// Keep this route as a redirect so existing links still land somewhere sensible.
export default async function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/projects/${id}/board`);
}

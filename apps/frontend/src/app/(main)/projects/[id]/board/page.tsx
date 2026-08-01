import { BoardPageClient } from './BoardPageClient';

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BoardPageClient projectId={id} />;
}

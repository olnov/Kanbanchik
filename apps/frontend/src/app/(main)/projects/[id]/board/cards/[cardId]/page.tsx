import { BoardPageClient } from '../../BoardPageClient';

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string; cardId: string }>;
}) {
  const { id, cardId } = await params;
  return <BoardPageClient projectId={id} cardId={cardId} />;
}

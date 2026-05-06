import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const teams = await api.getTeams();

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Teams</h1>
      {teams.map((t) => (
        <div key={t.id} style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: 12,
          boxShadow: 'var(--shadow-card)',
          fontWeight: 600,
        }}>
          {t.name}
        </div>
      ))}
    </div>
  );
}

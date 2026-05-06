'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Team } from '@/lib/types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api.getTeams()
      .then((data) => {
        if (isMounted) {
          setTeams(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Teams</h1>
      {teams.map((t) => (
        <div
          key={t.id}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 12,
            boxShadow: 'var(--shadow-card)',
            fontWeight: 600,
          }}
        >
          {t.name}
        </div>
      ))}
    </div>
  );
}

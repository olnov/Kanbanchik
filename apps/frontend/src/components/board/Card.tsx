import styles from './Card.module.css';
import { Badge } from '@/components/ui/Badge';
import type { Card as CardType, User } from '@/lib/types';

interface CardProps {
  card: CardType;
  assignee?: User;
  onClick: (card: CardType) => void;
}

export function Card({ card, assignee, onClick }: CardProps) {
  return (
    <div className={styles.card} onClick={() => onClick(card)}>
      <div className={styles.summary}>{card.summary}</div>
      <div className={styles.footer}>
        <div className={styles.badges}>
          <Badge value={card.priority} variant="priority" />
          <Badge value={card.type} variant="type" />
        </div>
        {assignee && (
          <div className={styles.assignee} title={assignee.name}>
            {assignee.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

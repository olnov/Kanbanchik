import { Draggable } from '@hello-pangea/dnd';
import styles from './Card.module.css';
import { Badge } from '@/components/ui/Badge';
import type { Card as CardType, User } from '@/lib/types';

interface CardProps {
  card: CardType;
  index: number;
  assignee?: User;
  onClick: (card: CardType) => void;
}

export function Card({ card, index, assignee, onClick }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.card}
          style={{
            ...provided.draggableProps.style,
            cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
            opacity: snapshot.isDragging ? 0.85 : 1,
            zIndex: snapshot.isDragging ? 1000 : 'auto',
          }}
          onClick={() => onClick(card)}
        >
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
      )}
    </Draggable>
  );
}

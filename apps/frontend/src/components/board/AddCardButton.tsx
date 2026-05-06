import styles from './Board.module.css';

export function AddCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.addCard} onClick={onClick}>
      + Add card
    </button>
  );
}

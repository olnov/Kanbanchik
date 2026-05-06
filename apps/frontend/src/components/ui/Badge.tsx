import styles from './Badge.module.css';

interface BadgeProps {
  value: string;
  variant?: 'priority' | 'type';
}

export function Badge({ value, variant = 'type' }: BadgeProps) {
  const cls = variant === 'priority'
    ? styles[value.toLowerCase() as keyof typeof styles]
    : styles[value.toLowerCase() as keyof typeof styles];
  return <span className={`${styles.badge} ${cls ?? ''}`}>{value}</span>;
}

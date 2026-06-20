import { Inter, Bricolage_Grotesque, Roboto_Mono } from 'next/font/google';
import styles from './layout.module.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' });
const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['800'], variable: '--font-bricolage-grotesque' });
const mono = Roboto_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-roboto-mono' });

const fontVars = `${inter.variable} ${display.variable} ${mono.variable}`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.viewport} ${fontVars}`}>
      <div className={styles.shell}>
        <span className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="5" height="16" rx="1.2" />
              <rect x="10" y="4" width="5" height="11" rx="1.2" />
              <rect x="17" y="4" width="4" height="7" rx="1.2" />
            </svg>
          </span>
          <span className={styles.logoWord}>Kanbanchik</span>
        </span>
        {children}
      </div>
    </div>
  );
}

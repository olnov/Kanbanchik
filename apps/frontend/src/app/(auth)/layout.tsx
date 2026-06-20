import { Inter, Bagel_Fat_One, Permanent_Marker } from 'next/font/google';
import styles from './layout.module.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' });
const display = Bagel_Fat_One({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const annotation = Permanent_Marker({ subsets: ['latin'], weight: '400', variable: '--font-annotation' });

const fontVars = `${inter.variable} ${display.variable} ${annotation.variable}`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.viewport} ${fontVars}`}>
      <div className={styles.shell}>
        <aside className={styles.brand}>
          <span className={styles.wordmark}>
            <span className={styles.mark} aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 12 10 18 20 6" />
              </svg>
            </span>
            Kanbanchik
          </span>

          <h1 className={styles.headline}>
            Plan it like you{' '}
            <span className={styles.accent}>
              doodle
              <svg className={styles.squiggle} viewBox="0 0 100 8" preserveAspectRatio="none"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M1 5 Q 14 1, 27 5 T 53 5 T 79 5 T 99 4" />
              </svg>
            </span>{' '}
            it.
          </h1>

          <p className={styles.tagline}>
            A friendly little board for your projects, your tasks, and the messy ideas in between.
          </p>

          <div className={styles.signature} aria-hidden="true">
            <div className={styles.blob} />
            <div className={styles.preview}>
              <div className={styles.previewHead}><span /><span /><span /></div>
              <div className={`${styles.task} ${styles.done}`}>
                <span className={`${styles.box} ${styles.checked}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 12 10 18 20 6" />
                  </svg>
                </span>
                Sketch the idea
              </div>
              <div className={styles.task}>
                <span className={styles.box} />
                Ship it
              </div>
            </div>
            <span className={styles.annotation}>
              drag me
              <svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8 H22" />
                <path d="M16 3 L23 8 L16 13" />
              </svg>
            </span>
          </div>
        </aside>

        <main className={styles.formCol}>{children}</main>
      </div>
    </div>
  );
}

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
        {children}
      </div>
    </div>
  );
}

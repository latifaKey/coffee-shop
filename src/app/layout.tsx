import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ToastsRoot from '@/components/ui/ToastsRoot';

export const metadata: Metadata = {
  title: "BARIZTA - Kopi Terbaik",
  description: "Nikmati kopi terbaik setiap hari.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                  document.documentElement.classList.add('theme-init');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <ToastsRoot />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

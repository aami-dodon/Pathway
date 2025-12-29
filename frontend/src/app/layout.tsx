import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { HeaderNavData, FooterContentData, SiteSettingsData, api } from "@/lib/api";
import { ComingSoon } from "@/components/ComingSoon";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

import { metadata as brandMetadata } from "../shared-generated/branding";

export const metadata: Metadata = {
  title: {
    default: brandMetadata.title,
    template: `%s | ${brandMetadata.title}`,
  },
  description: brandMetadata.description,
  keywords: brandMetadata.keywords.split(',').map(k => k.trim()),
  authors: [{ name: brandMetadata.author }],
  openGraph: {
    title: brandMetadata.title,
    description: brandMetadata.description,
    type: "website",
    url: brandMetadata.url,
    images: [
      {
        url: "/og-image.png", // We generated this in shared/assets and copied to public/
        width: 1200,
        height: 630,
        alt: brandMetadata.title,
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.svg',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/icon-192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/icon-512.png',
      },
    ],
  },
};

async function getHeaderNav(): Promise<HeaderNavData | null> {
  try {
    return await api.getGlobal<HeaderNavData>('header-nav', { cache: 'no-store' });
  } catch (error) {
    console.error("Failed to fetch header nav:", error);
    return null;
  }
}

async function getFooterContent(): Promise<FooterContentData | null> {
  try {
    return await api.getGlobal<FooterContentData>('footer-content', { cache: 'no-store' });
  } catch (error) {
    console.error("Failed to fetch footer content:", error);
    return null;
  }
}

async function getSiteSettings(): Promise<SiteSettingsData | null> {
  try {
    return await api.getGlobal<SiteSettingsData>('site-settings', { cache: 'no-store' });
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return null;
  }
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerNav = await getHeaderNav();
  const footerContent = await getFooterContent();
  const siteSettings = await getSiteSettings();

  const isMaintenanceMode = siteSettings?.maintenanceMode?.isEnabled ?? false;


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DynamicFavicon />
          <AuthProvider>
            {isMaintenanceMode && siteSettings ? (
              <ComingSoon
                data={siteSettings.maintenanceMode}
                socialLinks={siteSettings.socialLinks}
              />
            ) : (
              <div className="relative min-h-screen flex flex-col">
                <Header navigationLinks={headerNav?.navigationLinks} />
                <main className="flex-1">
                  <Breadcrumbs />
                  {children}
                </main>
                <Footer
                  footerData={footerContent || undefined}
                  socialLinks={siteSettings?.socialLinks}
                />
              </div>
            )}

            <Toaster position="top-right" />
          </AuthProvider>

        </ThemeProvider>
      </body>
    </html>
  );
}

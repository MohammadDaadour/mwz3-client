import { ReactNode } from "react";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { customTheme } from "@/theme";
import { getMessages, getTranslations } from "next-intl/server";
import { GlobalFooter } from "@/components/Footer";
import { GlobalHeader } from "@/components/Header";
import { GlobalMenu } from "@/components/GlobalMenu";
import { ICategory } from "@/interfaces";
import { AppProvider } from "@/providers";
import { NextIntlClientProvider } from "next-intl";
import { isAuth } from "@/libs/functions";
import type { Metadata } from "next";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@/app/globals.css";
import Script from "next/script";
import AnalyticsTrackerClient from "@/components/AnalyticsTracker";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "MWZ3",
  description: "Multi-Vendor Digital Market",
};

async function getMenuData() {
  const res = await fetch(`${process.env.API_URL}/categories`);
  return res.json();
}

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function RootLayout({ children, params: { locale } }: Props) {
  const dicts = await getMessages();
  const tMisc = await getTranslations("Misc");
  const tUser = await getTranslations("UserMenu");
  const rawMenuData: ICategory[] = await getMenuData();
  const auth = await isAuth();

  const menuData = rawMenuData
    .filter((item) => item.level === 1)
    .map((item, key) => ({
      order: item.order === 0 ? 100 + key : item.order,
      label: locale === "en" ? item.labelEn : item.labelAr,
      link: "/results?c=" + item.id.toString(),
      icon: item.icon,
      subs: rawMenuData
        .filter((sItem) => sItem.parent === item.id)
        .map((sItem, skey) => ({
          order: sItem.order === 0 ? 100 + skey : sItem.order,
          label: locale === "en" ? sItem.labelEn : sItem.labelAr,
          link: "/results?c=" + sItem.id.toString(),
        })),
    }))
    .sort((a, b) => a.order - b.order);

  const headerLabels = {
    btnLogin: tMisc("btnLogin"),
    btnSell: tMisc("btnSell"),
    btnSearch: tMisc("btnSearch"),
    regions: [tMisc("rgnUAE"), tMisc("rgnKSA"), tMisc("rgnEgypt")],
    lblRegion: tMisc("lblRegion"),
    lblLang: tMisc("lblLang"),
  };

  const drawerLabels = {
    btnProfile: tUser("btnProfile"),
    btnAds: tUser("btnAds"),
    btnFavs: tUser("btnFavs"),
    btnMessages: tUser("btnMessages"),
    btnSubs: tUser("btnSubs"),
    btnLogout: tUser("btnLogout"),
    btnBanners: tUser("btnBanners"),
    btnAreas: tUser("btnAreas"),
    btnCategories: tUser("btnCategories"),
    btnSubsTypes: tUser("btnSubsTypes"),
    btnUsers: tUser("btnUsers"),
    btnUsersAds: tUser("btnUsersAds"),
  };

  const FooterData = {
    data: [
      {
        label: tMisc("lnkSiteLinks"),
        links: [
          { label: tMisc("lnkMain"), link: "/" },
          { label: tMisc("lnkAbout"), link: "/about" },
          { label: tMisc("lnkContact"), link: "/contact" },
          { label: tMisc("lnkMap"), link: "/sitemap" },
          { label: tMisc("lnkTerms"), link: "/terms" },
          { label: tMisc("lnkPolicy"), link: "/policy" },
        ],
      },
      {
        label: tMisc("lnkCountries"),
        links: [
          { label: tMisc("rgnEgypt"), link: "3" },
          { label: tMisc("rgnKSA"), link: "2" },
          { label: tMisc("rgnUAE"), link: "1" },
        ],
      },
    ],
    misc: { rights: tMisc("rights"), slang: tMisc("slang") },
  };

  const modalLabels =
    locale === "en" ? { confirm: "Confirm", cancel: "Cancel" } : { confirm: "تأكيد", cancel: "إلغاء" };

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>              { /* Force light mode for now */ }                    
        <ColorSchemeScript defaultColorScheme='light' forceColorScheme='light' />
      </head>
      <body>
        <Script src='/fbsdk.js' />
        <NextIntlClientProvider messages={dicts}>
          <AppProvider>
            {/* <MantineProvider theme={customTheme} defaultColorScheme='light'> */}
            <MantineProvider theme={customTheme} defaultColorScheme='light' forceColorScheme='light'>
              <ModalsProvider labels={modalLabels}>
                <Notifications />
                <Toaster position="top-center" reverseOrder={false} />
                <GlobalHeader
                  headerLabels={headerLabels}
                  drawerLabels={drawerLabels}
                  drawerData={{ data: menuData, misc: { btnViewAll: tMisc("btnViewAll"), ctgMisc: tMisc("ctgMisc") } }}
                  auth={{ success: auth.success, user: auth.meta }}
                />
                <div className='main'>
                  {/* <GlobalMenu data={menuData} misc={{ btnViewAll: tMisc("btnViewAll"), ctgMisc: tMisc("ctgMisc") }} /> */}
                  {children}
                </div>
                <GlobalFooter {...FooterData} />
                <AnalyticsTrackerClient />
              </ModalsProvider>
            </MantineProvider>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

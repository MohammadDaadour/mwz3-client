import { ICategory, IImage } from "@/interfaces";
import { getTranslations } from "next-intl/server";
import { AdCardSquare } from "@/components/AdsCardsMarket";
import { AppContext } from "@/providers";
import { useContext } from "react";
import { publicFetcher } from "@/libs/functions";
import { CategoriesCarousel, WideCarousel } from "@/components/Carousels";

type Props = { params: { locale: string } };

async function getCtgRaw() {
  const ctgRaw = await fetch(`${process.env.API_URL}/categories`); //${process.env.API_URL}
  return ctgRaw.json();
}

async function getProducts(id: number) {
  const products = await fetch(`${process.env.API_URL}/ads/filter?c=${id}`);
  return products.json();
}

export default async function SupermarketPage({ params: { locale } }: Props) {
  const rawCtgData: ICategory[] = await getCtgRaw();
  const t = await getTranslations("Supermarket");
  // const context = useContext(AppContext);

  const filteredCategories = rawCtgData.filter(item => item.labelEn === "supermarket");

  const products = await getProducts(filteredCategories[0]?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('supermarketProducts')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.rows.map((pro: any) => (
          <AdCardSquare
            key={pro.id}
            ad={pro}
            locale={locale}
            labels={{ adCert: t('adCert'), adSpecial: t('adSpecial') }}
            favType={true}
          />
        ))}
      </div>

      {products.rows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('noProductsFound')}</p>
        </div>
      )}
    </div>
  );
}
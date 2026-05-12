import { SideBannerServer } from "@/components/BannersServer";
import { AreaFilters, CategoryFilters, SearchQuery, TypeFilters } from "@/components/SearchFilters";
import { SearchResults } from "@/components/SearchResults";
import { IArea, ICategory } from "@/interfaces";
import { Anchor } from "@mantine/core";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

type Props = { params: { locale: string } };

async function getCtgRaw() {
  const ctgRaw = await fetch(`${process.env.API_URL}/categories`);
  return ctgRaw.json();
}

async function getAreaRaw() {
  const areaRaw = await fetch(`${process.env.API_URL}/areas`);
  return areaRaw.json();
}



export default async function ResultsPage({ params: { locale } }: Props) {
  const rawCtgData: ICategory[] = await getCtgRaw();
  const rawAreaData: IArea[] = await getAreaRaw();
  const t = await getTranslations("Results");

  const ctgData = rawCtgData
    .map((item) => ({
      value: item.id.toString(),
      label: locale === "en" ? item.labelEn : item.labelAr,
      parent: item.parent.toString(),
      level: item.level,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const areaData = rawAreaData
    .map((item) => ({
      value: item.id.toString(),
      label: locale === "en" ? item.labelEn : item.labelAr,
      parent: item.parent.toString(),
      level: item.level,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div>
      <div className='w-full pb-2'>
        {/* <Anchor> */}
        <Link href='/'>الصفحة الرئيسية</Link>
        {/* </Anchor> */}
      </div>

      <div className='flex flex-row flex-wrap xl:flex-nowrap'>
        <div className='grow p-2 space-y-2'>
          <SearchQuery labels={{ setSearch: t("setSearch"), lblPlaceholder: t("lblPlaceholder") }} />
          <SearchResults
            locale={locale}
            labels={{ setResults: t("setResults"), adCert: t("adCert"), adSpecial: t("adSpecial") }}
          />
        </div>

        <div className='p-2 grow-0 shrink-0 space-y-2 w-full md:mx-0 md:w-60'>
          <CategoryFilters
            categories={ctgData}
            labels={{ setCtg: t("setCtg"), lblMainCtg: t("lblMainCtg"), lblSubCtg: t("lblSubCtg") }}
          />
          <AreaFilters
            areas={areaData}
            labels={{
              setArea: t("setArea"),
              lblCountry: t("lblCountry"),
              lblGovernorate: t("lblGovernorate"),
              lblProvience: t("lblProvience"),
              lblEmirate: t("lblEmirate"),
              lblCity: t("lblCity"),
              lblDistrict: t("lblDistrict"),
            }}
          />
          <TypeFilters
            labels={{ setType: t("setType"), lblBoosted: t("lblBoosted"), lblCertified: t("lblCertified") }}
          />
          <SideBannerServer />
        </div>
      </div>
    </div>
  );
}

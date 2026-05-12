"use client";

import { IArea, IAdsResult, SearchResultsProps } from "@/interfaces";
import { LoadingOverlay, Box, Pagination, Stack, Fieldset, Center, SimpleGrid } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import classes from "./SearchResults.module.css";
import { AdCardSquare } from "./AdsCards";
import { publicFetcher } from "@/libs/functions";
import Error from "../app/[locale]/error";

export function SearchResults({ locale, labels }: SearchResultsProps) {
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams()?.toString() ?? "";

  const { data, error, isLoading } = useSWR<IAdsResult>(
    `${process.env.API_URL}/ads/filter?pg=${page.toString()}&${searchParams}`,
    publicFetcher,
    { revalidateOnFocus: false }
  );

  const { data: areas } = useSWR<IArea[]>(`${process.env.API_URL}/areas/view/`, publicFetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <Box pos='relative' w='full' h='300px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  if (error) {
    return <Error />;
  }

  if (data && areas) {
    const modData = data.rows.map((ad) => ({
      ...ad,
      areaLbl:
        locale === "en"
          ? areas.find((zone) => zone.id === ad.areaFK)?.labelEn
          : areas.find((zone) => zone.id === ad.areaFK)?.labelAr,
    }));

    return (
      <Fieldset
        legend={`${data?.count} ${labels.setResults}`}
        p='xs'
        variant='filled'
        classNames={{ legend: classes.legend }}
      >
        <SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }} spacing='lg'>
          {modData.map((ad) => (
            <AdCardSquare
              key={ad.id}
              locale={locale}
              labels={labels}
              ad={ad}
              favType={true}
              withFav={false}
              withSpecial={false}
            />
          ))}
        </SimpleGrid>
        <Center mt='lg'>
          <Pagination total={Math.ceil(data.count / 10)} value={page} onChange={setPage} />
        </Center>
      </Fieldset>
    );
  }
}
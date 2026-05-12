"use client";

import { Box, Button, Card, Group, Image, Text } from "@mantine/core";
import useSWR from "swr";
import { IAdsResult } from "@/interfaces";
import { publicFetcher } from "@/libs/functions";
import NextImage from "next/image";
import { useFormatter } from "next-intl";
import { useToggle } from "@mantine/hooks";

type ProductsGridProps = {
  params: {
    locale: string;
    ctg: {
      id: number;
      label: string;
      link: string;
    };
  };
  dict: { btnViewMore: string };
};

export function ProductsGrid({ params, dict }: ProductsGridProps) {
  const format = useFormatter();
  const [toggled, toggle] = useToggle();
  const { data } = useSWR<IAdsResult>(
    `${process.env.API_URL}/ads/market?c=${params.ctg.id}`,
    publicFetcher,
  );

  if (data && data.count > 0) {
    return (
      <Box>
        <Group justify="space-between">
          <Box className="inline-flex items-baseline gap-4">
            <Text fz="h2" fw={700}>
              {params.ctg.label}
            </Text>
            <Text fz="lg" fw={700}>
              {data.count}
            </Text>
          </Box>
          <Button variant="transparent" onClick={() => toggle()}>
            {dict.btnViewMore}
          </Button>
        </Group>
        <Group
          wrap="wrap"
          gap="xs"
          my="md"
          mah={toggled ? undefined : 275}
          className="overflow-hidden"
        >
          {data.rows.map((item) => (
            <Card key={item.id} h={275} withBorder radius="md" w={187.5}>
              <Card.Section h={140} w={200} pos="relative" mb="xs">
                <Image
                  component={NextImage}
                  src={
                    item?.image
                      ? `${process.env.API_URL}/images/ads/${item.id}/${item.image}`
                      : undefined
                  }
                  fallbackSrc="/images/nocover300x150.svg"
                  alt="ad image"
                  height={140}
                  width={200}
                  fit="cover"
                  style={{ objectFit: "contain", width: "100%", height: "140px" }}
                  priority={false}
                />
              </Card.Section>

              <Text lineClamp={3} ta='center'>{item.label}</Text>
              <Text fw={600} ta="end" mt='auto'>
                {format.number(item?.value, {
                  numberingSystem: "latn",
                  style: "currency",
                  currency: item?.currency,
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Card>
          ))}
        </Group>
      </Box>
    );
  }
}

"use client";

import { AdminAdForm, BoostAdForm } from "@/components/Forms";
import { IAd } from "@/interfaces";
import { privateFetcher } from "@/libs/functions";
import { updateAdAction } from "@/libs/actions";
import { Link } from "@/navigation";
import {
  Anchor,
  Badge,
  Box,
  Center,
  Flex,
  Group,
  LoadingOverlay,
  Pagination,
  Table,
  Text,
  TextInput,
  Switch
} from "@mantine/core";
import { useFormatter } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import Error from "../../error";

type Props = { params: { locale: string } };

export default function AdminAdsPage({ params: { locale } }: Props) {

  const [query, setQuery] = useState("");

  const [showBoostRequests, setShowBoostRequests] = useState(false);

  return (
    <Flex direction='column' gap='xl'>
      <Group justify='space-between' align='end'>
        <Text fw={700} fz='h1'>
          إدارة الإعلانات
        </Text>
        <Group gap="md">
          <Switch
            label="طلبات الترويج فقط"
            checked={showBoostRequests}
            onChange={(e) => setShowBoostRequests(e.currentTarget.checked)}
          />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="بحث"
            w={250}
          />
        </Group>
      </Group>
      <AdminAdsResults locale={locale} query={query} showBoostRequests={showBoostRequests} />
    </Flex>
  );
}

type AdminAdsResults = {
  locale: string;
  query: string;
  showBoostRequests: boolean;
};

function AdminAdsResults({ locale, query, showBoostRequests }: AdminAdsResults) {
  const format = useFormatter();
  const [page, setPage] = useState(1);

  async function handleBoost(ad: number) {
    await updateAdAction(ad, { boosted: true });
    mutate();
  }

  async function handleRequestBoost(ad: number) {
    await updateAdAction(ad, { boost_request: true });
    mutate();
  }

  const endpoint = showBoostRequests
    ? `${process.env.API_URL}/ads/boost-requests?page=${page}`
    : `${process.env.API_URL}/ads/admin?pg=${page}&q=${query}`;

  const { data, error, isLoading, mutate } = useSWR<{ rows: IAd[]; count: number }>(
    // `${process.env.API_URL}/ads/admin?pg=${page}&q=${query}`,
    endpoint,
    privateFetcher
  );

  const badgeColor = (value: number) => {
    switch (value) {
      case 1:
        return "gray";
      case 2:
        return "yellow";
      case 3:
        return "blue";
      case 4:
        return "red";
      case 5:
        return "green";
      case 6:
        return "violet";
    }
  };

  if (error) {
    return <Error />;
  }

  if (isLoading) {
    return (
      <Box pos='relative' w='full' h='300px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  const planLabels: Record<string, string> = {
    ONE_DAY: "يوم واحد",
    THREE_DAYS: "ثلاث أيام",
    WEEK: "أسبوع",
    MONTH: "شهر",
  };

  if (data) {
    const rows = data.rows.map((item, key) => (
      <Table.Tr key={key}>
        <Table.Td>
          <Anchor component={Link} href={`/admin/ads/${item.id.toString(16)}`}>
            {item.id}
          </Anchor>
        </Table.Td>
        <Table.Td>{item.label}</Table.Td>
        <Table.Td>{item.notes}</Table.Td>
        <Table.Td>
          {format.dateTime(Date.parse(item.createdAt), { year: "numeric", month: "2-digit", day: "2-digit" })}
        </Table.Td>
        <Table.Td>
          {item.activatedAt
            ? format.dateTime(Date.parse(item.activatedAt), { year: "numeric", month: "2-digit", day: "2-digit" })
            : null}
        </Table.Td>
        <Table.Td>
          {item.deletedAt
            ? format.dateTime(Date.parse(item.deletedAt), { year: "numeric", month: "2-digit", day: "2-digit" })
            : null}
        </Table.Td>
        <Table.Td>
          {locale === "en" ? (
            <Badge color={badgeColor(item.state.id)}>{item.state.labelEn}</Badge>
          ) : (
            <Badge color={badgeColor(item.state.id)}>{item.state.labelAr}</Badge>
          )}
        </Table.Td>
        <Table.Td>
          <AdminAdForm ad={item.id} state={item.stateFK} notes={item.notes} />
        </Table.Td>
        <Table.Td>
          <BoostAdForm ad={item.id} boosted={item.boosted} boost_request={item.boost_request} plan={planLabels[item.boost_plan] || item.boost_plan} boost_end={item.boost_end} />
        </Table.Td>
      </Table.Tr>
    ));

    return (
      <>
        <Table.ScrollContainer minWidth='1200px'>
          <Table stickyHeader withTableBorder striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>العنوان</Table.Th>
                <Table.Th>ملاحظات</Table.Th>
                <Table.Th>تاريخ الإنشاء</Table.Th>
                <Table.Th>تاريخ التفعيل</Table.Th>
                <Table.Th>تاريخ الحذف</Table.Th>
                <Table.Th>الحالة</Table.Th>
                <Table.Th></Table.Th>
                <Table.Th>الترويج</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Center mt='lg'>
          <Pagination total={Math.ceil(data.count / 15)} value={page} onChange={setPage} />
        </Center>
      </>
    );
  }
}

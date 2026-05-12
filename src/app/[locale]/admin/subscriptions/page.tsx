"use client";

import { ISub } from "@/interfaces";
import { privateFetcher } from "@/libs/functions";
import {
  ActionIcon,
  Box,
  Center,
  Flex,
  Group,
  LoadingOverlay,
  Menu,
  Pagination,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useFormatter } from "next-intl";
import useSWR from "swr";
import Error from "../../error";
import { useState } from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { updateSub } from "@/libs/actions";

type Props = { params: { locale: string } };

export default function AdminSubscriptionsPage({ params: { locale } }: Props) {
  const [query, setQuery] = useState("");
  return (
    <Flex direction='column' gap='xl'>
      <Group justify='space-between'>
        <Text fw={700} fz='h1'>
          إدارة الإشتراكات
        </Text>
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder='بحث باسم العميل'
          w={250}
        />
      </Group>
      <AdminSubscriptionsResutlts locale={locale} query={query} />
    </Flex>
  );
}

type AdminSubscriptionsResutlts = {
  locale: string;
  query: string;
};

function AdminSubscriptionsResutlts({ locale, query }: AdminSubscriptionsResutlts) {
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const activeModal = (duration: number, subId: number) => {
    modals.openConfirmModal({
      children: <Text>{`سيتم تفعيل الاشتراك لمدة ${duration} يوما تبدأ من تاريخ اليوم`}</Text>,
      onConfirm: () => {
        handleActivate(subId, duration);
      },
    });
  };

  const deactiveModal = (subId: number) => {
    modals.openConfirmModal({
      children: <Text>{`سيتم الغاء تفعيل الاشتراك`}</Text>,
      onConfirm: () => {
        handleDeactivate(subId);
      },
    });
  };

  function setType(value: string) {
    switch (value) {
      case "ads":
        return "عدد اعلانات";
      case "type":
        return "نوع حساب";
      case "boost":
        return "ترويج اعلانات";
      case "cert":
        return "توثيق حساب";
      default:
        return "";
    }
  }

  const { data, isLoading, error, mutate } = useSWR<{ rows: ISub[]; count: number }>(
    `${process.env.API_URL}/subs?pg=${page}&q=${query}`,
    privateFetcher
  );

  function setEnd(date: Date, days: number) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function setStart(date: Date) {
    var result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  function handleActivate(id: number, duration: number) {
    const startDate = setStart(new Date());
    const endDate = setEnd(startDate, duration);
    console.log(duration > 0 ? endDate : null);
    updateSub(id, { active: true, activatedAt: startDate, endsAt: duration > 0 ? endDate : undefined });
    mutate();
  }

  function handleDeactivate(id: number) {
    updateSub(id, { active: false });
    mutate();
  }

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

  if (data) {
    const rows = data.rows.map((item, key) => (
      <Table.Tr key={key}>
        <Table.Td>{item.id}</Table.Td>
        <Table.Td>{item.userFK}</Table.Td>
        <Table.Td>{item.user.label}</Table.Td>
        <Table.Td>{setType(item.subType.type)}</Table.Td>
        <Table.Td>
          {format.dateTime(Date.parse(item.createdAt), { year: "numeric", month: "2-digit", day: "2-digit" })}
        </Table.Td>
        <Table.Td>
          {item.activatedAt
            ? format.dateTime(Date.parse(item.activatedAt), { year: "numeric", month: "2-digit", day: "2-digit" })
            : null}
        </Table.Td>
        <Table.Td>
          {item.endsAt
            ? format.dateTime(Date.parse(item.endsAt), { year: "numeric", month: "2-digit", day: "2-digit" })
            : null}
        </Table.Td>
        <Table.Td>{item.active ? "مفعل" : "متوقف"}</Table.Td>
        <Table.Td>
          <Menu offset={0} position={locale === "en" ? "right" : "left"} withArrow>
            <Menu.Target>
              <ActionIcon variant='transparent' color='gray'>
                <IconDotsVertical stroke={2} width={"75%"} height={"75%"} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown p={0}>
              <Menu.Item disabled={item.active} onClick={() => activeModal(item.subType.duration, item.id)}>
                تفعيل
              </Menu.Item>
              <Menu.Item disabled={!item.active} onClick={() => deactiveModal(item.id)}>
                إيقاف
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
                <Table.Th>رقم العميل</Table.Th>
                <Table.Th>العميل</Table.Th>
                <Table.Th>النوع</Table.Th>
                <Table.Th>تاريخ الإنشاء</Table.Th>
                <Table.Th>تاريخ التفعيل</Table.Th>
                <Table.Th>تاريخ الانتهاء</Table.Th>
                <Table.Th>الحالة</Table.Th>
                <Table.Th></Table.Th>
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

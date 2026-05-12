"use client";

import { CategoryModalForm } from "@/components/Forms";
import { ICategory } from "@/interfaces";
import { publicFetcher } from "@/libs/functions";
import { Link } from "@/navigation";
import { Anchor, Flex, Group, Table, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import useSWR from "swr";

type Props = { params: { locale: string } };

export default function AdminCategoriesPage({ params: { locale } }: Props) {
  const { data } = useSWR<ICategory[]>(`${process.env.API_URL}/categories`, publicFetcher);

  if (data) {
    const rows = data
      .filter((item) => item.level === 1)
      .sort((a, b) => a.id - b.id)
      .map((item, key) => (
        <Table.Tr key={key}>
          <Table.Td>{item.id}</Table.Td>
          <Table.Td>{item.labelAr}</Table.Td>
          <Table.Td>{item.labelEn}</Table.Td>
          <Table.Td>{item.icon}</Table.Td>
          <Table.Td>{item.order}</Table.Td>
          <Table.Td>{item.promote ? <IconCheck stroke={2} /> : <IconX stroke={2} />}</Table.Td>
          <Table.Td>
            <Anchor component={Link} href={`/admin/categories/${item.id}`} underline='never'>
              عرض فرعي
            </Anchor>
          </Table.Td>
          <Table.Td>
            <CategoryModalForm data={data} item={item} variant='transparent' />
          </Table.Td>
        </Table.Tr>
      ));

    return (
      <Flex direction='column' gap='xl'>
        <Group justify='space-between'>
          <Text fw={700} fz='h1'>
            إدارة التصنيفات
          </Text>
          <CategoryModalForm data={data} />
        </Group>
        <Table.ScrollContainer minWidth='1200px'>
          <Table stickyHeader withTableBorder striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>اسم عربي</Table.Th>
                <Table.Th>اسم اجنبي</Table.Th>
                <Table.Th>الأيقونة</Table.Th>
                <Table.Th>الترتيب</Table.Th>
                <Table.Th>الترويج</Table.Th>
                <Table.Th></Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Flex>
    );
  }
}

"use client";

import { CategoryModalForm } from "@/components/Forms";
import { ICategory } from "@/interfaces";
import { publicFetcher } from "@/libs/functions";
import { Flex, Group, Table, Text } from "@mantine/core";
import { IconCheckbox, IconX } from "@tabler/icons-react";
import useSWR from "swr";

type Props = { params: { locale: string; id: string } };

export default function AdminCategoriesSubPage({ params: { locale, id } }: Props) {
  const { data } = useSWR<ICategory[]>(`${process.env.API_URL}/categories`, publicFetcher);

  if (data) {
    const rows = data
      .filter((item) => item.parent === +id)
      .sort((a, b) => a.id - b.id)
      .map((item, key) => (
        <Table.Tr key={key}>
          <Table.Td>{item.id}</Table.Td>
          <Table.Td>{item.labelAr}</Table.Td>
          <Table.Td>{item.labelEn}</Table.Td>
          <Table.Td>{item.promote ? <IconCheckbox stroke={2} /> : <IconX stroke={2} />}</Table.Td>
          <Table.Td>
            <CategoryModalForm data={data} item={item} variant='transparent' />
          </Table.Td>
        </Table.Tr>
      ));
    return (
      <Flex direction='column' gap='xl'>
        <Group justify='space-between'>
          <Text fw={700} fz='h1'>
            {`إدارة التصنيفات: ${data.find((item) => item.id === +id)?.labelAr}`}
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
                <Table.Th>الترويج</Table.Th>
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

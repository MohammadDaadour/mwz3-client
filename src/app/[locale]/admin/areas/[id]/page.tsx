"use client";

import { AreaModalForm } from "@/components/Forms";
import { IArea } from "@/interfaces";
import { publicFetcher } from "@/libs/functions";
import { Link } from "@/navigation";
import { Anchor, Flex, Group, Table, Text } from "@mantine/core";
import useSWR from "swr";

type Props = { params: { locale: string; id: string } };

export default function AdminAreasLv2Page({ params: { locale, id } }: Props) {
  const { data } = useSWR<IArea[]>(`${process.env.API_URL}/areas`, publicFetcher);
  const { data: areaTitle } = useSWR<IArea[]>(`${process.env.API_URL}/areas/${id}/view`, publicFetcher);

  if (data && areaTitle) {
    const rows = data
      .filter((zone) => zone.parent === +id)
      .map((zone, key) => (
        <Table.Tr key={key}>
          <Table.Td>{zone.id}</Table.Td>
          <Table.Td>{zone.labelAr}</Table.Td>
          <Table.Td>{zone.labelEn}</Table.Td>
          {zone.level < 4 && (
            <Table.Td>
              <Anchor component={Link} href={`/admin/areas/${zone.id}`} underline='never'>
                عرض فرعي
              </Anchor>
            </Table.Td>
          )}
          <Table.Td>
            <AreaModalForm data={data} item={zone} variant='transparent' />
          </Table.Td>
        </Table.Tr>
      ));

    return (
      <Flex direction='column' gap='xl'>
        <Group justify='space-between'>
          <Text fw={700} fz='h1'>
            {`إدارة المناطق: ${areaTitle[0].labelAr}`}
          </Text>
          <AreaModalForm data={data} />
        </Group>
        <Table.ScrollContainer minWidth='1000px'>
          <Table stickyHeader withTableBorder striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>اسم عربي</Table.Th>
                <Table.Th>اسم اجنبي</Table.Th>
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

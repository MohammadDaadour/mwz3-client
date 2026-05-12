"use client";

import { ISubType } from "@/interfaces";
import { privateFetcher } from "@/libs/functions";
import { ActionIcon, Flex, Group, Menu, Modal, Table, Text } from "@mantine/core";
import useSWR from "swr";
import Error from "../../error";
import { useFormatter } from "next-intl";
import { IconDotsVertical } from "@tabler/icons-react";
import { deleteSubType, restoreSubType, updateSubType } from "@/libs/actions";
import { SubsTypeAdd, SubsTypeEdit } from "@/components/Forms";
import { modals } from "@mantine/modals";

type Props = { params: { locale: string } };

export default function AdminSubsTypesPage({ params: { locale } }: Props) {
  const format = useFormatter();

  const editModal = (item: ISubType) => {
    modals.open({
      // title: "تعديل",
      children: <SubsTypeEdit props={{ locale: locale, item: item }} emitClose={() => closeModals()} />,
    });
  };

  function closeModals() {
    mutate();
    modals.closeAll();
  }

  const { data, isLoading, error, mutate } = useSWR<ISubType[]>(`${process.env.API_URL}/substypes`, privateFetcher);

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

  function setValue(value: number, curr: string) {
    return format.number(value, {
      numberingSystem: "latn",
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    });
  }

  function handleState(id: number, state: boolean) {
    updateSubType(id, { active: state });
    mutate();
  }

  function handleDelete(id: number, action: string) {
    if (action === "delete") {
      deleteSubType(id);
    } else {
      restoreSubType(id);
    }
    mutate();
  }

  if (error) {
    return (
      <>
        <Error />
      </>
    );
  }

  if (data) {
    const rows = data.map((item, index) => (
      <Table.Tr key={index}>
        <Table.Td>{item.id}</Table.Td>
        <Table.Td>{item.labelAr}</Table.Td>
        <Table.Td>{item.area.labelAr}</Table.Td>
        <Table.Td>{item.duration}</Table.Td>
        <Table.Td>{setValue(item.value, item.currency)}</Table.Td>
        <Table.Td>{setType(item.type)}</Table.Td>
        <Table.Td>{item.deletedAt !== null ? "ملغي" : item.active ? "نشط" : "معطل"}</Table.Td>
        <Table.Td>
          <Menu offset={0} position={locale === "en" ? "right" : "left"} withArrow>
            <Menu.Target>
              <ActionIcon variant='transparent' color='gray'>
                <IconDotsVertical stroke={2} width={"75%"} height={"75%"} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => editModal(item)}>تعديل</Menu.Item>
              {item.active ? (
                <Menu.Item onClick={() => handleState(item.id, false)}>تعطيل</Menu.Item>
              ) : (
                <Menu.Item onClick={() => handleState(item.id, true)}>تنشيط</Menu.Item>
              )}
              {item.deletedAt === null ? (
                <Menu.Item c='red' onClick={() => handleDelete(item.id, "delete")}>
                  الغاء
                </Menu.Item>
              ) : (
                <Menu.Item onClick={() => handleDelete(item.id, "restore")}>استعادة</Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    ));
    return (
      <Flex direction='column' gap='xl'>
        <Group justify='space-between'>
          <Text fw={700} fz='h1'>
            أنواع الاشتراكات
          </Text>
          <SubsTypeAdd props={{ locale: locale }} emitClose={mutate} />
        </Group>
        <Table.ScrollContainer minWidth='1200px'>
          <Table stickyHeader withTableBorder striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>عنوان</Table.Th>
                <Table.Th>منطقة</Table.Th>
                <Table.Th>{`مدة (يوم)`}</Table.Th>
                <Table.Th>قيمة</Table.Th>
                <Table.Th>نوع</Table.Th>
                <Table.Th>حالة</Table.Th>
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

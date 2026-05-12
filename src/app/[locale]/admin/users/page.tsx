"use client";

import { IUser } from "@/interfaces";
import { updateUserAction, updateUserType } from "@/libs/actions";
import { privateFetcher } from "@/libs/functions";
import { Link } from "@/navigation";
import { AppContext } from "@/providers";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Center,
  Flex,
  Group,
  LoadingOverlay,
  Menu,
  Pagination,
  Select,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconDotsVertical } from "@tabler/icons-react";
import { useFormatter } from "next-intl";
import { useContext, useState, useRef, useEffect } from "react";
import useSWR from "swr";
import Error from "../../error";

type Props = { params: { locale: string } };

export default function AdminUsersPage({ params: { locale } }: Props) {
  const [query, setQuery] = useState("");

  return (
    <Flex direction='column' gap='xl'>
      <Group justify='space-between' align="end">
        <Text fw={700} fz='h1'>
          إدارة المستخدمين
        </Text>
        <TextInput value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder='بحث' w={250} />
      </Group>
      <AdminUsersResults locale={locale} query={query} />
    </Flex>
  );
}

type AdminUsersResults = {
  locale: string;
  query: string;
};

function AdminUsersResults({ locale, query }: AdminUsersResults) {
  const format = useFormatter();
  const context = useContext(AppContext);
  // const [userType, setUserType] = useState<string | null>("");
  const userTypeRef = useRef<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, error, isLoading, mutate } = useSWR<{ rows: IUser[]; count: number }>(
    context.user.id > 0 ? `${process.env.API_URL}/users?pg=${page}&role=${context.user.role}&q=${query}` : null,
    privateFetcher
  );

  const usersTypes = [
    // { value: "admin", label: "أدمن" },
    { value: "user", label: "مستخدم عادي" },
    { value: "merch", label: "تاجر" },
    { value: "su", label: "مدير" }
  ];

  function getUserType(value: string) {
    switch (value) {
      case "su":
        return "مدير";
      case "admin":
        return "اداري";
      case "merch":
        return "تاجر";
      default:
        return "عادي";
    }
  }

  async function handleCert(type: boolean, user: number) {
    await updateUserAction(user, { certified: type });
    mutate();
  }

  async function handelActivate(type: boolean, user: number) {
    await updateUserAction(user, { activatedAt: type ? new Date() : null });
    mutate();
  }

  const editModal = (id: number) => {
    let selectedType: string | null = null;

    modals.openConfirmModal({
      title: "تعديل نوع حساب",
      children: (
        <Select
          data={usersTypes}
          placeholder="اختر نوع الحساب"
          onChange={(value) => {
            selectedType = value;
          }}
        />
      ),
      onConfirm: async () => {
        if (selectedType && selectedType.length > 0) {
          try {
            await updateUserAction(id, { type: selectedType });
            mutate();
          } catch (error) {
            console.error("Error updating user:", error);
          }
        }
      },
    });
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

  if (data) {
    const rows = data.rows.map((item, key) => (
      <Table.Tr key={key}>
        <Table.Td>
          {(item.type === "user" && item.activatedAt) || (item.type === "merch" && item.activatedAt) ? (
            <Anchor component={Link} href={`/users/${item.id.toString(16)}`} target='_blank' underline='never'>
              {item.id}
            </Anchor>
          ) : (
            item.id
          )}
        </Table.Td>
        <Table.Td>{item.email}</Table.Td>
        <Table.Td>{item.label}</Table.Td>
        <Table.Td>{item.phone}</Table.Td>
        <Table.Td>{item.certified ? <Badge size='lg'>موثق</Badge> : null}</Table.Td>
        <Table.Td>{item.areaFK ? item.area.labelAr : null}</Table.Td>
        <Table.Td>{getUserType(item.type)}</Table.Td>
        <Table.Td>
          {format.dateTime(Date.parse(item.createdAt), { year: "numeric", month: "2-digit", day: "2-digit" })}
        </Table.Td>
        <Table.Td>
          {item.activatedAt
            ? format.dateTime(Date.parse(item.activatedAt), { year: "numeric", month: "2-digit", day: "2-digit" })
            : null}
        </Table.Td>
        {/* <Table.Td>
          {item.deletedAt
            ? format.dateTime(Date.parse(item.deletedAt), { year: "numeric", month: "2-digit", day: "2-digit" })
            : null}
        </Table.Td> */}
        <Table.Td>
          <Menu offset={0} position={locale === "en" ? "right" : "left"} withArrow disabled={
            (context.user.role === "su" && item.type === "su") || item.type ==="admin"
          }>
            <Menu.Target>
              <ActionIcon variant='transparent' color='gray'>
                <IconDotsVertical stroke={2} width={"75%"} height={"75%"} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown p={0}>
              <Menu.Item disabled={item.certified} onClick={() => handleCert(true, item.id)}>
                توثيق
              </Menu.Item>
              <Menu.Item disabled={!item.certified} onClick={() => handleCert(false, item.id)}>
                الغاء التوثيق
              </Menu.Item>
              <Menu.Item disabled={item.activatedAt ? true : false} onClick={() => handelActivate(true, item.id)}>
                تفعيل
              </Menu.Item>
              <Menu.Item disabled={item.activatedAt ? false : true} onClick={() => handelActivate(false, item.id)}>
                الغاء التفعيل
              </Menu.Item>
              <Menu.Item disabled={
                (context.user.role === "su" && item.type === "su") || item.type ==="admin"
              } onClick={() => editModal(item.id)}>
                تغيير نوع الحساب
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
                <Table.Th>البريد الإلكتروني</Table.Th>
                <Table.Th>الاسم</Table.Th>
                <Table.Th>هاتف</Table.Th>
                <Table.Th>توثيق</Table.Th>
                <Table.Th>البلد</Table.Th>
                <Table.Th>حساب</Table.Th>
                <Table.Th>تاريخ الإنشاء</Table.Th>
                <Table.Th>تاريخ التفعيل</Table.Th>
                {/* <Table.Th>تاريخ الحذف</Table.Th> */}
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

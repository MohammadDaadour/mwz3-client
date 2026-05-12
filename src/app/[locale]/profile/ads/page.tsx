"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useContext, useState } from "react";
import useSWR from "swr";
import {
  Badge,
  Box,
  LoadingOverlay,
  Table,
  Center,
  Pagination,
  Text,
  Group,
  Button,
  Menu,
  ActionIcon,
  Anchor,
  Radio,
  Card
} from "@mantine/core";
import { ICategory, IAdsResult } from "@/interfaces";
import { IconDotsVertical } from "@tabler/icons-react";
import { AppContext } from "@/providers";
import { Link } from "@/navigation";
import { privateFetcher, publicFetcher } from "@/libs/functions";
import Error from "../../error";
import { deleteAdAction, updateAdAction } from "@/libs/actions";
import { modals } from "@mantine/modals";
import { useRouter } from "@/navigation";
import { sendBoostingRequest } from "@/libs/actions";

type Props = { params: { locale: string } };

export default function UserAdsPage({ params: { locale } }: Props) {
  const router = useRouter();
  const t = useTranslations("UserAds");
  const context = useContext(AppContext);
  const format = useFormatter();
  const [page, setPage] = useState(1);

  const phone = "201228833747";
  const messages: Record<string, string> = {
    ONE_DAY: 'مرحبا، أريد ترويج إعلاني لمدة يوم واحد',
    THREE_DAYS: 'مرحبا، أريد ترويج إعلاني لمدة ثلاث أيام',
    WEEK: 'مرحبا، أريد ترويج إعلاني لمدة أسبوع',
  };

  const handleClick = (plan: string, adMeta?: any) => { 

    const baseMessage = messages[plan];
    const withAdInfo = `${baseMessage}\n\nإعلان رقم: ${adMeta?.id}\nالعنوان: ${adMeta?.title}`;
    const message = encodeURIComponent(withAdInfo); 

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };


  const confirmationModal = (
    type: string,
    keyWord: { ar: string; en: string },
    messages: { context: string },
    adMeta: any
  ) => {
    let duration = "ONE_DAY";

    modals.openConfirmModal({
      title: locale === "en" ? `${keyWord.en} Ad` : `${keyWord.ar} إعلان`,
      confirmProps: { color: type === "delete" ? "red" : "var(--mantine-primary-color-filled)" },
      children: (
        <>
          {locale === "en" ? (
            <>
              <Text>{`Do you want to ${keyWord.en} ad ${adMeta.id} ${adMeta.title} ?`}</Text>
              <Text>{messages.context}</Text>
            </>
          ) : (
            <>
              <Text>{`هل تريد ${keyWord.ar} الإعلان ${adMeta.id} ${adMeta.title} ؟`}</Text>
              <Text>{messages.context}</Text>
            </>
          )}

          {type === "boost" && (
            <Radio.Group
              defaultValue="ONE_DAY"
              onChange={(value) => (duration = value)}
              label={locale === "en" ? "Select duration" : "اختر المدة"}
              mt="lg"
            >
              <Card className="m-2">
                <Radio value="ONE_DAY" label={locale === "en" ? "1 Day" : "يوم"} />
                <Text className="font-bold mt-4 text-xl text-amber-500">
                  {t('planPriceOneDay')}
                </Text>
              </Card>
              <Card className="m-2">
                <Radio value="THREE_DAYS" label={locale === "en" ? "3 Days" : "٣ أيام"} />
                <Text className="font-bold mt-4 text-xl text-amber-500">
                  {t('planPriceThreeDays')}
                </Text>
              </Card>
              <Card className="m-2">
                <Radio className="cursor-pointer" value="WEEK" label={locale === "en" ? "1 Week" : "أسبوع"} />
                <Text className="font-bold mt-4 text-xl text-amber-500">
                  {t('planPriceWeek')}
                </Text>
              </Card>
            </Radio.Group>
          )}
        </>
      ),
      onConfirm: () => {
        switch (type) {
          case "submit":
            handleSubmit(adMeta.id);
            break;
          case "publish":
            handlePublish(adMeta.id);
            break;
          case "boost":
            handleRequestBoost(adMeta.id, duration, adMeta);
            break;
          case "edit":
            handleEdit(adMeta.id);
            break;
          case "done":
            handleDone(adMeta.id);
            break;
          case "delete":
            handleDelete(adMeta.id);
            break;
        }
      },
    });
  };


  async function handleSubmit(ad: number) {
    await updateAdAction(ad, { stateFK: 2 });
    mutate();
  }

  async function handlePublish(ad: number) {
    await updateAdAction(ad, { stateFK: 5, activatedAt: new Date() });
    mutate();
  }

  async function handleRequestBoost(ad: number, plan: string, adMeta: any) {
    handleClick(plan, adMeta);
    await sendBoostingRequest({ id: ad, plan });
    mutate();
  }

  async function handleEdit(ad: number) {
    await updateAdAction(ad, { stateFK: 1 });
    mutate();
    router.push(`/profile/ads/${ad.toString(16)}/edit`);
  }

  async function handleDone(ad: number) {
    await updateAdAction(ad, { stateFK: 6 });
    mutate();
  }

  async function handleDelete(ad: number) {
    await deleteAdAction(ad);
    mutate();
  }

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

  const { data, error, isLoading, mutate } = useSWR<IAdsResult>(
    `${process.env.API_URL}/ads/user/${context?.user?.id}?pg=${page.toString()}`,
    privateFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const { data: categories } = useSWR<ICategory[]>(`${process.env.API_URL}/categories/view/`, publicFetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <Box pos='relative' w='full' h='300px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  if (context.user.id > 0 && error) {
    return <Error />;
  }

  if (context.user.id > 0 && data && categories) {
    const modData = data.rows.map((ad) => ({
      ...ad,
      categoryLbl:
        locale === "en"
          ? categories.find((ctg) => ctg.id === ad.categoryFK)?.labelEn
          : categories.find((ctg) => ctg.id === ad.categoryFK)?.labelAr,
    }));

    const rows = modData.map((item) => (
      <Table.Tr key={item?.id}>
        <Table.Td>
          <Anchor component={Link} href={`/profile/ads/${item?.id.toString(16)}`} underline='never'>
            {item?.id}
          </Anchor>
        </Table.Td>
        <Table.Td>{item?.label}</Table.Td>
        <Table.Td>
          {format.number(item?.value, {
            numberingSystem: "latn",
            style: "currency",
            currency: item?.currency,
            maximumFractionDigits: 0,
          })}
        </Table.Td>
        <Table.Td>
          {item?.boosted ? (
            <Badge>ينتهي في {new Date(item.boost_end).toLocaleString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</Badge>
          ) : item?.boost_request ? (
            <Badge>تم ارسال الطلب</Badge>
          ) : (
            "#"
          )}
        </Table.Td>        <Table.Td>{item?.notes}</Table.Td>
        <Table.Td align='char'>
          {item?.activatedAt
            ? format.dateTime(Date.parse(item?.activatedAt), { year: "numeric", month: "2-digit", day: "2-digit" })
            : null}
        </Table.Td>
        <Table.Td align='char'>
          {format.dateTime(Date.parse(item?.createdAt), { year: "numeric", month: "2-digit", day: "2-digit" })}
        </Table.Td>
        <Table.Td>{item?.categoryLbl}</Table.Td>
        <Table.Td>
          <Group align='center' justify='end'>
            {locale === "en" ? (
              <Badge color={badgeColor(item?.state?.id)}>{item?.state?.labelEn}</Badge>
            ) : (
              <Badge color={badgeColor(item?.state?.id)}>{item?.state?.labelAr}</Badge>
            )}
            <Menu offset={0} position={locale === "en" ? "right" : "left"} withArrow>
              <Menu.Target>
                <ActionIcon variant='transparent' color='gray'>
                  <IconDotsVertical stroke={2} width={"75%"} height={"75%"} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown p={0}>
                {item?.stateFK === 1 && (
                  <Menu.Item
                    onClick={() =>
                      confirmationModal(
                        "submit",
                        { ar: "اعتماد", en: "Submit" },
                        { context: t("msgSubmit") },
                        { id: item.id, title: item.label }
                      )
                    }
                  >
                    {t("btnSubmit")}
                  </Menu.Item>
                )}
                {item?.stateFK === 3 && (
                  <Menu.Item
                    onClick={() =>
                      confirmationModal(
                        "publish",
                        { ar: "نشر", en: "Publish" },
                        { context: t("msgPublish") },
                        { id: item.id, title: item.label }
                      )
                    }
                  >
                    {t("btnPublish")}
                  </Menu.Item>
                )}
                {/* <Anchor component={Link} href={'/boost-plans'} underline='never'> */}
                <Menu.Item
                  disabled={item?.stateFK !== 5 || item?.boosted === true}
                  onClick={() =>
                    confirmationModal(
                      "boost",
                      { ar: "ترويج", en: "Boost" },
                      { context: "" },
                      { id: item.id, title: item.label }
                    )
                  }
                >
                  {t("btnBoost")}
                </Menu.Item>
                {/* </Anchor> */}
                <Menu.Item
                  disabled={item?.stateFK === 6}
                  onClick={() =>
                    confirmationModal(
                      "edit",
                      { ar: "تعديل", en: "Edit" },
                      { context: t("msgEdit") },
                      { id: item.id, title: item.label }
                    )
                  }
                >
                  {t("btnEdit")}
                </Menu.Item>
                {item?.stateFK === 5 && (
                  <Menu.Item
                    color='blue'
                    onClick={() =>
                      confirmationModal(
                        "done",
                        { ar: "انهاء", en: "finish" },
                        { context: t("msgDone") },
                        { id: item.id, title: item.label }
                      )
                    }
                  >
                    {t("btnDone")}
                  </Menu.Item>
                )}
                <Menu.Item
                  color='red'
                  disabled={item?.stateFK === 6}
                  onClick={() =>
                    confirmationModal(
                      "delete",
                      { ar: "حذف", en: "Delete" },
                      { context: t("msgDelete") },
                      { id: item.id, title: item.label }
                    )
                  }
                >
                  {t("btnDelete")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Table.Td>
      </Table.Tr>
    ));

    return (
      <div>
        <Group my='lg' justify='space-between' align='center'>
          <Group justify='start' align='baseline'>
            <Text fw={700} fz='h1'>
              {t("title")}
            </Text>
            <Text fw={500}>{`${t("total")} ${data?.count}`}</Text>
          </Group>
          <Button component={Link} href='/profile/ads/new'>
            {t("btnNew")}
          </Button>
        </Group>

        <Table.ScrollContainer minWidth='1200px'>
          <Table stickyHeader withTableBorder striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className='text-center'>{t("lblId")}</Table.Th>
                <Table.Th>{t("lblLabel")}</Table.Th>
                <Table.Th>{t("lblValue")}</Table.Th>
                <Table.Th>{t("lblBoostedTitle")}</Table.Th>
                <Table.Th>{t("lblNotes")}</Table.Th>
                <Table.Th>{t("lblActivated")}</Table.Th>
                <Table.Th>{t("lblCreated")}</Table.Th>
                <Table.Th>{t("lblCategory")}</Table.Th>
                <Table.Th className='text-center'>{t("lblState")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Center mt='lg'>
          <Pagination total={Math.ceil(data.count / 15)} value={page} onChange={setPage} />
        </Center>
      </div>
    );
  }
}

"use client";

import { SideBanner } from "@/components/Banners";
import {
  Alert,
  Button,
  Center,
  ComboboxItem,
  Fieldset,
  FileInput,
  Flex,
  LoadingOverlay,
  NumberInput,
  Select,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import classes from "../../styles.module.css";
import { hasLength, isNotEmpty, useForm } from "@mantine/form";
import { useContext, useState } from "react";
import useSWR from "swr";
import { publicFetcher } from "@/libs/functions";
import { IAd, IArea, ICategory } from "@/interfaces";
import { AppContext } from "@/providers";
import { createAdAction, uploadAdImagesAction } from "@/libs/actions";
import { modals } from "@mantine/modals";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string };
};

export default function NewAdPage({ params: { locale } }: Props) {
  const context = useContext(AppContext);
  const router = useRouter();
  const [ctgMain, setCtgMain] = useState<ComboboxItem | null>(null);
  const [ctgSub, setCtgSub] = useState<ComboboxItem | null>(null);
  const [areaLv1, setAreaLv1] = useState<ComboboxItem | null>(null);
  const [areaLv2, setAreaLv2] = useState<ComboboxItem | null>(null);
  const [areaLv3, setAreaLv3] = useState<ComboboxItem | null>(null);
  const [areaLv4, setAreaLv4] = useState<ComboboxItem | null>(null);
  const [currency, setCurrency] = useState({ value: "", label: "" });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("AdForm");

  const [isMarket, setIsMarket] = useState(false);

  const { data: categories } = useSWR<ICategory[]>(`${process.env.API_URL}/categories`, publicFetcher, {
    revalidateOnFocus: false,
  });
  const { data: areas } = useSWR<IArea[]>(`${process.env.API_URL}/areas`, publicFetcher, {
    revalidateOnFocus: false,
  });

  const adForm = useForm({
    mode: "uncontrolled",
    initialValues: { title: "", description: "", value: 0, category: "", area: "" },
    validate: {
      title: hasLength({ min: 10, max: 250 }, t("errTitle")),
      description: hasLength({ max: 1000 }, t("errDesc")),
      category: isNotEmpty(),
      area: isNotEmpty(),
    },
    clearInputErrorOnChange: false,
  });

  function areaChange(option: ComboboxItem, level: number) {
    switch (level) {
      case 1:
        setAreaLv1(option);
        setAreaLv2(null);
        setAreaLv3(null);
        setAreaLv4(null);
        break;
      case 2:
        setAreaLv2(option);
        setAreaLv3(null);
        setAreaLv4(null);
        break;
      case 3:
        setAreaLv3(option);
        setAreaLv4(null);
        break;
      case 4:
        setAreaLv4(option);
        break;
    }
    adForm.setValues({ area: option ? option.value : undefined });
  }

  function categoryChange(option: ComboboxItem, level: number) {
    switch (level) {
      case 1:
        setCtgMain(option);
        setCtgSub(null);
        break;
      case 2:
        setCtgSub(option);
        break;
    }
    adForm.setValues({ category: option ? option.value : undefined });
  }

  function currencyChange(option: ComboboxItem) {
    switch (option.value) {
      case "1":
        setCurrency({ value: "AED", label: locale === "en" ? "AED" : "د.إ" });
        break;
      case "2":
        setCurrency({ value: "SAR", label: locale === "en" ? "SAR" : "ر.س" });
        break;
      case "3":
        setCurrency({ value: "EGP", label: locale === "en" ? "EGP" : "ج.م" });
        break;
      default:
        setCurrency({ value: "", label: "" });
        break;
    }
  }

  function handleImages(value: File[]) {
    if (value.length > 5) {
      modals.open({
        withCloseButton: false,
        children: <Alert color='red'>{t("errImage")}</Alert>,
        styles: { body: { padding: 0 } },
      });
    } else {
      setImages(value);
    }
  }

  async function handleSubmit(values: typeof adForm.values) {
    setLoading(true);
    if (context.user.id > 0) {
      const formData = {
        label: values.title,
        value: values.value,
        currency: currency.value,
        description: values.description,
        userFK: context.user.id,
        areaFK: parseInt(values.area, 10),
        categoryFK: parseInt(values.category, 10),
        stateFK: 1,
      };

      const { data, status }: { data: IAd; status: number } = await createAdAction(formData);

      var imgStatus: number = 0;

      if (images.length > 0) {
        const formImages = new FormData();
        images.forEach((file) => formImages.append("files", file));
        imgStatus = await uploadAdImagesAction(data.id, formImages);
      }

      if (imgStatus < 400 && status === 201) {
        router.push(`/profile/ads/${data.id.toString(16)}`);
      } else {
        setLoading(false);
      }
    }
  }

  return (
    <Flex direction='row' gap='sm' classNames={{ root: classes.parent }}>
      <Flex direction='column' p='xs' gap='xs' pos='relative' classNames={{ root: classes.mainSection }}>
        <LoadingOverlay visible={loading} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
        <form onSubmit={adForm.onSubmit(handleSubmit)} className='grid grid-cols-1 gap-2.5 lg:grid-cols-2'>
          <Flex direction='column' gap='xs'>
            <Fieldset
              legend={t("setArea")}
              p={12}
              variant='filled'
              classNames={{ legend: classes.legend }}
              className='space-y-2'
            >
              <Select
                label={t("lblCountry")}
                data={areas
                  ?.filter((item) => item.parent === 0)
                  .map((item) => ({ value: item.id.toString(), label: locale === "en" ? item.labelEn : item.labelAr }))}
                onChange={(_value, option) => (areaChange(option, 1), currencyChange(option))}
              />
              <Select
                label={t("lblGov")}
                data={
                  areaLv1
                    ? areas
                      ?.filter((item) => item.parent.toString() === areaLv1?.value)
                      .map((item) => ({
                        value: item.id.toString(),
                        label: locale === "en" ? item.labelEn : item.labelAr,
                      }))
                    : undefined
                }
                onChange={(_value, option) => areaChange(option, 2)}
                searchable
                disabled={areaLv1 === null}
              />
              <Select
                label={t("lblCity")}
                data={
                  areaLv2
                    ? areas
                      ?.filter((item) => item.parent.toString() === areaLv2?.value)
                      .map((item) => ({
                        value: item.id.toString(),
                        label: locale === "en" ? item.labelEn : item.labelAr,
                      }))
                    : undefined
                }
                onChange={(_value, option) => areaChange(option, 3)}
                searchable
                disabled={areaLv2 === null}
              />
              <Select
                label={t("lblDistrict")}
                data={
                  areaLv3
                    ? areas
                      ?.filter((item) => item.parent.toString() === areaLv3?.value)
                      .map((item) => ({
                        value: item.id.toString(),
                        label: locale === "en" ? item.labelEn : item.labelAr,
                      }))
                    : undefined
                }
                onChange={(_value, option) => areaChange(option, 4)}
                searchable
                disabled={
                  areaLv3 === null || areas?.filter((item) => item.parent.toString() === areaLv3.value).length === 0
                }
              />
              <TextInput
                {...adForm.getInputProps("area", { type: "input" })}
                key={adForm.key("area")}
                readOnly
                display='none'
              />
              {adForm.errors.area && (
                <Center>
                  <Text c='red' fw={500} fz='sm'>
                    {t("errArea")}
                  </Text>
                </Center>
              )}
            </Fieldset>
            <Fieldset
              legend={t("setCtg")}
              p={12}
              variant='filled'
              classNames={{ legend: classes.legend }}
              className='space-y-2'
            >
              {/* Removed Super Market button */}
              <Select
                label={t("lblMainCtg")}
                data={categories
                  ?.filter((item) => item.parent === 0)
                  .map((item) => ({ value: item.id.toString(), label: locale === "en" ? item.labelEn : item.labelAr }))}
                onChange={(_value, option) => categoryChange(option, 1)}
                searchable
              />
              <Select
                label={t("lblSubCtg")}
                data={
                  ctgMain
                    ? categories
                      ?.filter((item) => item.parent.toString() === ctgMain?.value)
                      .map((item) => ({
                        value: item.id.toString(),
                        label: locale === "en" ? item.labelEn : item.labelAr,
                      }))
                    : undefined
                }
                onChange={(_value, option) => categoryChange(option, 2)}
                searchable
                disabled={ctgMain === null}
              />
              <TextInput
                {...adForm.getInputProps("category", { type: "input" })}
                key={adForm.key("category")}
                readOnly
                display='none'
              />
              {adForm.errors.category && (
                <Center>
                  <Text c='red' fw={500} fz='sm'>
                    {t("errCtg")}
                  </Text>
                </Center>
              )}
            </Fieldset>
          </Flex>
          <Flex direction='column' gap='xs'>
            <Fieldset
              legend={t("setMeta")}
              p={12}
              variant='filled'
              classNames={{ legend: classes.legend }}
              className='space-y-2'
            >
              <NumberInput
                {...adForm.getInputProps("value", { type: "input" })}
                key={adForm.key("value")}
                label={t("lblValue")}
                thousandSeparator={true}
                allowDecimal={false}
                allowNegative={false}
                rightSection={<Text pe={20}>{currency.label}</Text>}
              />
              <TextInput
                {...adForm.getInputProps("title", { type: "input" })}
                key={adForm.key("title")}
                label={t("lblTitle")}
              />
              <Textarea
                {...adForm.getInputProps("description", { type: "input" })}
                key={adForm.key("description")}
                label={t("lblDesc")}
                autosize
                minRows={4}
                maxRows={8}
              />
              <FileInput
                multiple
                accept='image/*'
                clearable
                value={images}
                onChange={handleImages}
                label={t("lblImages")}
                description={t("descImages")}
                placeholder={t("btnImages")}
              />
            </Fieldset>
          </Flex>
          <Center className='lg:col-span-2'>
            <Button type='submit'>{t("btnSubmit")}</Button>
          </Center>
        </form>
      </Flex>
      <Flex direction='column' gap='xs' classNames={{ root: classes.side }}>
        <SideBanner />
      </Flex>
    </Flex>
  );
}

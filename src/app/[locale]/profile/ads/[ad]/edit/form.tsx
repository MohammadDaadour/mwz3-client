"use client";

import {
  Button,
  Center,
  ComboboxItem,
  Fieldset,
  Flex,
  NumberInput,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import classes from "../../../styles.module.css";
import { IAd, IArea, ICategory } from "@/interfaces";
import { hasLength, isNotEmpty, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { updateAdAction } from "@/libs/actions";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

type Props = {
  locale: string;
  data: IAd;
  areas: IArea[];
  categories: ICategory[];
};

export function UserAdsItemForm({ locale, data, areas, categories }: Props) {
  const router = useRouter();
  const [ctgMain, setCtgMain] = useState<ComboboxItem | null>(null);
  const [ctgSub, setCtgSub] = useState<ComboboxItem | null>(null);
  const [areaLv1, setAreaLv1] = useState<ComboboxItem | null>(null);
  const [areaLv2, setAreaLv2] = useState<ComboboxItem | null>(null);
  const [areaLv3, setAreaLv3] = useState<ComboboxItem | null>(null);
  const [areaLv4, setAreaLv4] = useState<ComboboxItem | null>(null);
  const [currency, setCurrency] = useState({ value: "", label: "" });
  const t = useTranslations("AdForm");

  const adForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: data.label,
      description: data?.description,
      value: data.value,
      category: data.categoryFK.toString(),
      area: data.areaFK.toString(),
      currency: data.currency,
    },
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

  useEffect(() => {
    switch (data.category.level) {
      case 2:
        setCtgMain(
          categories
            .filter((ctg) => ctg.id === data.category.parent)
            .map((ctg) => ({ value: ctg.id.toString(), label: locale === "en" ? ctg.labelEn : ctg.labelAr }))[0]
        );
        setCtgSub(
          categories
            .filter((ctg) => ctg.id === data.category.id)
            .map((ctg) => ({ value: ctg.id.toString(), label: locale === "en" ? ctg.labelEn : ctg.labelAr }))[0]
        );
        break;
      case 1:
        setCtgMain(
          categories
            .filter((ctg) => ctg.id === data.category.id)
            .map((ctg) => ({ value: ctg.id.toString(), label: locale === "en" ? ctg.labelEn : ctg.labelAr }))[0]
        );
        break;
    }

    switch (data.area.level) {
      case 4:
        var cityOpt = areas.filter((zone) => zone.id === data.area.parent)[0];
        var govOpt = areas.filter((zone) => zone.id === cityOpt.parent)[0];
        setAreaLv4(
          areas
            .filter((zone) => zone.id === data.area.id)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        setAreaLv3(
          areas
            .filter((zone) => zone.id === data.area.parent)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        setAreaLv2(
          areas
            .filter((zone) => zone.id === cityOpt.parent)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        setAreaLv1(
          areas
            .filter((zone) => zone.id === govOpt.parent)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        break;
      case 3:
        var govOpt = areas.filter((zone) => zone.id === data.area.parent)[0];
        setAreaLv3(
          areas
            .filter((zone) => zone.id === data.area.id)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        setAreaLv2(
          areas
            .filter((zone) => zone.id === data.area.parent)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        setAreaLv1(
          areas
            .filter((zone) => zone.id === govOpt.parent)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        break;
      case 2:
        setAreaLv2(
          areas
            .filter((zone) => zone.id === data.area.id)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        setAreaLv1(
          areas
            .filter((zone) => zone.id === data.area.parent)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        break;
      case 1:
        setAreaLv1(
          areas
            .filter((zone) => zone.id === data.area.id)
            .map((zone) => ({ value: zone.id.toString(), label: locale === "en" ? zone.labelEn : zone.labelAr }))[0]
        );
        break;
    }

    currencyChange({ value: data.currency === "AED" ? "1" : data.currency === "KSA" ? "2" : "3", label: "" });
  }, []);

  async function handleSubmit(values: typeof adForm.values) {
    const formData = {
      label: values.title,
      value: values.value,
      currency: currency.value,
      description: values.description,
      areaFK: parseInt(values.area, 10),
      categoryFK: parseInt(values.category, 10),
    };
    const status = await updateAdAction(data.id, formData);
    if (status === 200) {
      router.push(`/profile/ads/${data.id.toString(16)}`);
    }
  }

  return (
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
            value={areaLv1 ? areaLv1.value : null}
            data={areas
              ?.filter((item) => item.parent === 0)
              .map((item) => ({ value: item.id.toString(), label: locale === "en" ? item.labelEn : item.labelAr }))}
            onChange={(_value, option) => (areaChange(option, 1), currencyChange(option))}
          />
          <Select
            label={t("lblGov")}
            value={areaLv2 ? areaLv2.value : null}
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
            value={areaLv3 ? areaLv3.value : null}
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
            value={areaLv4 ? areaLv4.value : null}
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
          <Select
            label={t("lblMainCtg")}
            value={ctgMain ? ctgMain.value : null}
            data={categories
              .filter((item) => item.parent === 0)
              .map((item) => ({ value: item.id.toString(), label: locale === "en" ? item.labelEn : item.labelAr }))}
            onChange={(_value, option) => categoryChange(option, 1)}
            searchable
          />
          <Select
            label={t("lblSubCtg")}
            value={ctgSub ? ctgSub.value : null}
            data={
              ctgMain
                ? categories
                    .filter((item) => item.parent.toString() === ctgMain?.value)
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
        </Fieldset>
      </Flex>
      <Center className='lg:col-span-2'>
        <Button type='submit'>{t("btnSubmit")}</Button>
      </Center>
    </form>
  );
}

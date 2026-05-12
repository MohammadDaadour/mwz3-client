"use client";

import { hasLength, isEmail, isNotEmpty, matches, matchesField, useForm } from "@mantine/form";
import {
  Button,
  Checkbox,
  Container,
  PasswordInput,
  TextInput,
  Text,
  Center,
  Alert,
  Select,
  ComboboxItem,
} from "@mantine/core";
import { ReactElement, useState } from "react";
import { useTranslations } from "next-intl";
import { registerAction } from "@/libs/actions";

type props = {
  params: { locale: string };
};

export default function RegisterPage({ params: { locale } }: props) {
  const t = useTranslations("Register");
  const [validateMsg, setValidateMsg] = useState<ReactElement>(<></>);

  const registerForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      pass: "",
      passConfirm: "",
      name: "",
      phone: "",
      area: "",
      agreement: false,
    },
    validate: {
      email: isEmail(t("errEmail")),
      pass: hasLength({ min: 6 }, t("errPass")),
      passConfirm: matchesField("pass", t("errPassConfirm")),
      name: hasLength({ min: 5, max: 30 }, t("errName")),
      phone: matches(/(^(01){1}[0-9]{9})|(^(05){1}[0-9]{8})|^$/, t("errPhone")),
      area: isNotEmpty(t("errArea")),
      agreement: isNotEmpty(),
    },
    clearInputErrorOnChange: false,
  });

  const regions = [
    { value: "3", label: locale === "en" ? "Egypt" : "مصر" },
    { value: "1", label: locale === "en" ? "UAE" : "الإمارات" },
    { value: "2", label: locale === "en" ? "KSA" : "السعودية" },
  ];

  function handleArea(option: ComboboxItem | null) {
    if (option) {
      registerForm.setFieldValue("area", option.value);
    } else {
      registerForm.setFieldValue("area", "");
    }
  }

  async function handleSubmit(values: typeof registerForm.values) {
    

    const { passConfirm, agreement, ...rest } = values;

    const payload = {
      ...rest,
      area: Number(rest.area), // convert to number here
    };

    console.log("✅ Payload being sent:", payload);
    const { data, status } = await registerAction(payload);


    // console.log('📦 Data being sent to registerAction:', values);
    if (status >= 400) {
      console.log(data.message)
      switch (data.message) {
        case "User with this email already exists":
          setValidateMsg(
            <Alert variant='light' color='red'>
              <Text>{t("errExists")}</Text> 
            </Alert>
          );
          break;
        default:
          setValidateMsg(
            <Alert variant='light' color='red'>
              <Text>{t("errElse")}</Text>
            </Alert>
          );
      }
    } else {
      setValidateMsg(
        <Alert variant='light' color='blue'>
          <Text>{t("msgSuccess")}</Text>
        </Alert>
      );
    }
  }

  return (
    <Container className='max-w-sm' pos='relative' p='md'>
      <Text fz='h2' fw={700}>
        {t("title")}
      </Text>
      <form onSubmit={registerForm.onSubmit(handleSubmit)} className='space-y-4 mt-4'>
        <TextInput
          {...registerForm.getInputProps("email", { type: "input" })}
          key={registerForm.key("email")}
          label={t("lblEmail")}
          withAsterisk
        />
        <PasswordInput
          {...registerForm.getInputProps("pass", { type: "input" })}
          key={registerForm.key("pass")}
          label={t("lblPass")}
          withAsterisk
        />
        <PasswordInput
          {...registerForm.getInputProps("passConfirm", { type: "input" })}
          key={registerForm.key("passConfirm")}
          label={t("lblPassConfirm")}
          withAsterisk
        />
        <TextInput
          {...registerForm.getInputProps("name", { type: "input" })}
          key={registerForm.key("name")}
          label={t("lblName")}
          withAsterisk
        />
        <TextInput
          {...registerForm.getInputProps("phone", { type: "input" })}
          key={registerForm.key("phone")}
          label={t("lblPhone")}
          description={t("dscPhone")}
        />
        <Select
          label={t("lblCountry")}
          data={regions}
          onChange={(_value, option) => handleArea(option)}
          error={registerForm.errors.area}
          clearable={false}
        />
        <Checkbox
          required={true}
          {...registerForm.getInputProps("agreement", { type: "checkbox" })}
          key={registerForm.key("agreement")}
          label={t("lblAgreement")}
        />
        <Center>
          <Button type='submit'>{t("btnCreate")}</Button>
        </Center>

        {Object.keys(validateMsg?.props).length > 0 ? validateMsg : null}
      </form>
    </Container>
  );
}

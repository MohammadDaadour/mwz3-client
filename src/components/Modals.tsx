"use client";

import { updatePasswordAction, updateUserAction } from "@/libs/actions";
import { Alert, Button, ComboboxItem, Group, Modal, PasswordInput, Select, Text, TextInput } from "@mantine/core";
import { hasLength, matches, matchesField, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function UpdatePassModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const [visible, setVisible] = useState(false);
  const t = useTranslations("UpdateUser");

  const updatePassForm = useForm({
    mode: "uncontrolled",
    initialValues: { pass: "", passConfirm: "" },
    validate: {
      pass: hasLength({ min: 6 }, t("errPass")),
      passConfirm: matchesField("pass", t("errPassMismatch")),
    },
    clearInputErrorOnChange: false,
  });

  async function handleSubmit(values: typeof updatePassForm.values) {
    const { data, status } = await updatePasswordAction(values.pass);
    if (status === 200) {
      updatePassForm.reset();
      setVisible(true);
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} size='xs' title={t("titlePass")}>
        <form onSubmit={updatePassForm.onSubmit(handleSubmit)} className='flex flex-col gap-y-4'>
          <PasswordInput
            {...updatePassForm.getInputProps("pass", { type: "input" })}
            key={updatePassForm.key("pass")}
            label={t("lblPass")}
            withAsterisk
          />
          <PasswordInput
            {...updatePassForm.getInputProps("passConfirm", { type: "input" })}
            key={updatePassForm.key("passConfirm")}
            label={t("lblPassConfirm")}
            withAsterisk
          />
          <Button type='submit' className='ms-auto'>
            {t("btnSubmit")}
          </Button>
        </form>
        {visible && (
          <Alert color='green' mt='md'>
            <Text>{t("msgPassOk")}</Text>
          </Alert>
        )}
      </Modal>
      <Button mx='auto' onClick={open}>
        {t("titlePass")}
      </Button>
    </>
  );
}

type Props = {
  user: { id: number; name: string; phone: string };
  locale: 'ar' | 'en'
};

// const updateUserForm = useForm({
//   mode: "uncontrolled",
//   initialValues: { label: user.name, phone: user.phone },
//   validate: {
//     label: hasLength({ min: 5, max: 30 }, t("errName")),
//     phone: matches(/(^(01){1}[0-9]{9})|(^(05){1}[0-9]{8})|^$/, t("errPhone")),
//   },
//   clearInputErrorOnChange: false,
// });

export function UpdateUserModal({ user, locale }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [visible, setVisible] = useState(false);
  const t = useTranslations("UpdateUser");

  const updateUserForm = useForm({
    mode: 'uncontrolled',
    initialValues: { label: user.name, phone: user.phone || '' },
    validate: {
      label: hasLength({ min: 5, max: 30 }, t('errName')),
      phone: (value) => {
        if (!value) return null;
        const digits = value.replace(/\D/g, '');
        if (digits.length < 11) return t('errPhoneMinDigits');
        if (!/^(010|011|012|015|05)/.test(digits)) {
          return t('errPhonePrefix');
        }
        if (value.length > 20) return t('errPhoneLength');
        return null;
      },
    },
    clearInputErrorOnChange: false,
  });

  async function handleSubmit(values: typeof updateUserForm.values) {
    const { status, data } = await updateUserAction(user.id, values);
    if (status === 200) {
      updateUserForm.reset();
      // setVisible(true);
      close();
      window.location.reload();
    }
    else {
      // const errorKey = data?.error || "UNKNOWN_ERROR";

      // const errorMessages = {
      //   INVALID_PHONE: {
      //     ar: "رقم الهاتف غير صالح",
      //     en: "Invalid phone number",
      //   },
      //   USER_NOT_FOUND: {
      //     ar: "المستخدم غير موجود",
      //     en: "User not found",
      //   },
      //   UNKNOWN_ERROR: {
      //     ar: "حصل خطأ غير معروف",
      //     en: "An unknown error occurred",
      //   },
      // };

      // type ErrorKey = keyof typeof errorMessages;
      // const errorKey = (data?.error as ErrorKey) || "UNKNOWN_ERROR";

      updateUserForm.setErrors({
        phone: data?.message || "Something went wrong",
      });

      // updateUserForm.setErrors({
      //   phone: errorMessages[errorKey]?.[locale] || errorMessages.UNKNOWN_ERROR[locale],
      // });
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} size='xs' title={t("titleMeta")}>
        <form onSubmit={updateUserForm.onSubmit(handleSubmit)} className='flex flex-col gap-y-4'>
          <TextInput
            {...updateUserForm.getInputProps("label", { type: "input" })}
            key={updateUserForm.key("label")}
            label={t("lblName")}
            withAsterisk
          />
          <TextInput
            {...updateUserForm.getInputProps("phone", { type: "input" })}
            key={updateUserForm.key("phone")}
            label={t("lblPhone")}
          />
          <Button type='submit' className='ms-auto'>
            {t("btnSubmit")}
          </Button>
        </form>
        {visible && (
          <Alert color='green' mt='md'>
            <Text>{t("msgMetaOk")}</Text>
          </Alert>
        )}
      </Modal>
      <Button mx='auto' onClick={open}>
        {t("titleMeta")}
      </Button>
    </>
  );
}

export function UpdateCountryModal({ userId, locale, emit }: { userId: number; locale: string; emit: () => void }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [value, setValue] = useState<ComboboxItem | null>(null);
  const t = useTranslations("UserProfile");

  const regions = [
    { value: "3", label: locale === "en" ? "Egypt" : "مصر" },
    { value: "1", label: locale === "en" ? "UAE" : "الإمارات" },
    { value: "2", label: locale === "en" ? "KSA" : "السعودية" },
  ];

  async function handleUpdate() {
    if (value) {
      await updateUserAction(userId, { areaFK: value.value });
      emit();
      close();
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close}>
        <Group grow preventGrowOverflow={false} align='end'>
          <Select
            label={t("lblCountry")}
            value={value ? value.value : null}
            data={regions}
            onChange={(_value, option) => setValue(option)}
            clearable={false}
          />
          <Button onClick={handleUpdate} disabled={value === null} className='grow-0'>
            {t("btnCountry")}
          </Button>
        </Group>
      </Modal>
      <Button onClick={open} size='compact-sm'>
        {t("btnCountry")}
      </Button>
    </>
  );
}

export function UpdateCountryModalForce({
  userId,
  locale,
  emit,
  state
}: {
  userId: number;
  locale: string;
  emit: () => void;
  state: boolean
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [value, setValue] = useState<ComboboxItem | null>(null);
  const t = useTranslations("UserProfile");

  const regions = [
    { value: "3", label: locale === "en" ? "Egypt" : "مصر" },
    { value: "1", label: locale === "en" ? "UAE" : "الإمارات" },
    { value: "2", label: locale === "en" ? "KSA" : "السعودية" },
  ];

  async function handleUpdate() {
    if (value) {
      await updateUserAction(userId, { areaFK: value.value });
      emit();
      close();
    }
  }

  return (
    <>
      <Modal opened={state} onClose={close} withCloseButton={false} closeOnClickOutside={false} closeOnEscape={false}>
        <Text fw={600}>{t("msgCountry")}</Text>
        <Group grow preventGrowOverflow={false} align='end'>
          <Select
            label={t("lblCountry")}
            value={value ? value.value : null}
            data={regions}
            onChange={(_value, option) => setValue(option)}
            clearable={false}
          />
          <Button onClick={handleUpdate} disabled={value === null} className='grow-0'>
            {t("btnCountry")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}

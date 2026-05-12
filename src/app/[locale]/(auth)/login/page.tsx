"use client";

import { Link, useRouter, usePathname } from "@/navigation";
import {
  Anchor,
  Button,
  Text,
  Checkbox,
  Container,
  Group,
  PasswordInput,
  TextInput,
  Alert,
  Divider,
  LoadingOverlay,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { IconBrandFacebookFilled, IconBrandGoogleFilled } from "@tabler/icons-react";
import { useContext, useState } from "react";
import { useTranslations } from "next-intl";
import { AppContext } from "@/providers";
import { loginAction } from "@/libs/actions";

export default function LoginPage() {
  const context = useContext(AppContext);
  const t = useTranslations("Login");
  const router = useRouter();
  const path = usePathname();
  const [validateMsg, setValidateMsg] = useState(<></>);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "", remember: false },
    validate: { email: isEmail(t("errEmail")), password: isNotEmpty(t("errPass")) },
    clearInputErrorOnChange: true,
    onValuesChange() {
      setValidateMsg(<></>);
    },
  });

  async function handleSubmit(values: typeof loginForm.values) {
    setLoading(true);
    const { data, status } = await loginAction(values);
    if (status >= 400) {
      switch (data.message) {
        case "mismatch":
          setValidateMsg(
            <>
              <Text>{t("errMismatch")}</Text>
              <Anchor component={Link} href='/reset-password' underline='always' onClick={() => modals.closeAll()}>
                {t("lblForgotPass")}
              </Anchor>
            </>
          );
          break;
        case "unactive":
          setValidateMsg(
            <>
              <Text>{t("errUnactive")}</Text>
              <Anchor component={Link} href='/activate' underline='always' onClick={() => modals.closeAll()}>
                {t("errUnactiveLink")}
              </Anchor>
            </>
          );
          break;
        default:
          setValidateMsg(<Text>{`${t("errElse")} ${status}`}</Text>);
          break;
      }
      setLoading(false);
    } else {
      if (path.includes("login") || path.includes("register") || path.includes("admin") || path.includes("profile")) {
        router.push("/");
      }
      modals.closeAll();
      setLoading(false);
      context.setContextUser();
      router.refresh();
    }
  }

  return (
    <Container className='max-w-sm' pos='relative' p='md'>
      <Text fz='h2' fw={700}>
        {t("title")}
      </Text>
      <LoadingOverlay visible={loading} zIndex={400} loaderProps={{ type: "bars" }} overlayProps={{ blur: 1 }} />
      <Group align='center' justify='space-around' my='md'>
        <Button bg='blue' component={Link} href='/facebook'>
          <Text pe={4}>{t("btnLoginWith")}</Text>
          <IconBrandFacebookFilled />
        </Button>
        <Button bg='red' component={Link} href='/google'>
          <Text pe={4}>{t("btnLoginWith")}</Text>
          <IconBrandGoogleFilled />
        </Button>
      </Group>
      <Divider label={t("lblWithEmail")} labelPosition='center' my='lg' />
      <form onSubmit={loginForm.onSubmit((values) => handleSubmit(values))}>
        <TextInput
          {...loginForm.getInputProps("email", { type: "input" })}
          key={loginForm.key("email")}
          label={t("lblEmail")}
        />
        <PasswordInput
          {...loginForm.getInputProps("password", { type: "input" })}
          key={loginForm.key("password")}
          mt='md'
          label={t("lblPass")}
        />
        <Group justify='space-around' my='md'>
          <Checkbox
            {...loginForm.getInputProps("remember", { type: "checkbox" })}
            key={loginForm.key("remember")}
            label={t("lblKeepSigned")}
            my='auto'
          />
          <Button type='submit'>{t("btnLogin")}</Button>
        </Group>
        {Object.keys(validateMsg.props).length > 0 ? (
          <Alert variant='light' color='red'>
            {validateMsg}
          </Alert>
        ) : null}
      </form>
      <Group align='center' justify='center' my='md'>
        <Anchor component={Link} href='/register' onClick={modals.closeAll}>
          {t("lblNoAccount")}
        </Anchor>
        <Anchor component={Link} href='/reset-password' onClick={modals.closeAll}>
          {t("lblForgotPass")}
        </Anchor>
      </Group>
    </Container>
  );
}

"use client";

import { Button } from "@mantine/core";
import LoginPage from "@/app/[locale]/(auth)/login/page";
import { modals } from "@mantine/modals";

type Props = {
  btnLogin: string;
  variant?: string;
  size?: string;
};

export function LoginModal({ btnLogin, variant = "subtle", size = "compact-lg" }: Props) {
  const loginModal = () =>
    modals.open({
      size: "sm",
      children: <LoginPage />,
    });

  return (
    <Button className="text-black font-bold hover:bg-gray-100 hover:text-blue-900 transition-all duration-500" onClick={loginModal} variant={variant} size={size} fz='md'>
      {btnLogin}
    </Button>
  );
}

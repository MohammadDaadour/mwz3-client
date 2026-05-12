"use client";

import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconShoppingCart } from "@tabler/icons-react";
import { Cart } from "./Cart";
import { useContext } from "react";
import { AppContext } from "@/providers";

type Props = {
  variant?: string;
  size?: string;
  onClickCallback?: () => void;
};

export function CartModal({ variant = "subtle", size = "compact-lg", onClickCallback }: Props) {
  const context = useContext(AppContext);
  
  const cartModal = () => {
    if (onClickCallback) onClickCallback();
    
    modals.open({
      size: "md",
      children: <Cart auth={{ success: context.user.id > 0, user: { id: context.user.id } }} />,
    });
  };

  return (
    <Button onClick={cartModal} variant={variant} size={size} p={0}>
      <IconShoppingCart size={24} />
    </Button>
  );
}
"use client";

import cx from "clsx";
import { Button, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import classes from "./ThemeToggle.module.css";

type Props = {
  variant?: string;
  size?: string;
  iconSize?: number;
};

export function ThemeToggle({ variant = "solid", size = "compact-lg", iconSize }: Props) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
    >
      <IconSun className={cx(classes.icon, classes.light)} size={iconSize} stroke={1.5} />
      <IconMoon className={cx(classes.icon, classes.dark)} size={iconSize} stroke={1.5} />
    </Button>
  );
}

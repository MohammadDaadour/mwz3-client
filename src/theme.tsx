"use client";

import { createTheme, MantineColorsTuple } from "@mantine/core";

const Blue1: MantineColorsTuple = [
  "#e8f7ff",
  "#d9ecf4",
  "#b6d5e5",
  "#90bed5",
  "#6faac7",
  "#5b9dbf",
  "#4e97bd",
  "#3c83a6",
  "#307496",
  "#186585",
];

const Blue2: MantineColorsTuple = [
  "#ebf7fe",
  "#d8ecf8",
  "#abd9f4",
  "#7cc4ef",
  "#5ab3ed",
  "#48a8eb",
  "#3da2ec",
  "#318dd1",
  "#257ebc",
  "#076da6",
];

const PaleBlue: MantineColorsTuple = [
  "#eef3ff",
  "#dce4f5",
  "#b9c7e2",
  "#94a8d0",
  "#748dc1",
  "#5f7cb8",
  "#5474b4",
  "#44639f",
  "#39588f",
  "#2d4b81",
];

const PaleRed: MantineColorsTuple = [
  "#ffeaec",
  "#fdd4d6",
  "#f4a7ac",
  "#ec777e",
  "#e64f57",
  "#e3353f",
  "#e22732",
  "#c91a25",
  "#b31220",
  "#9e0419",
];

const DeepOrange: MantineColorsTuple = [
  '#fff4e2',
  '#ffe9cc',
  '#ffd09c',
  '#fdb766',
  '#fca13a',
  '#fb931d',
  '#fc8c0c',
  '#e17900',
  '#c86a00',
  '#ae5a00'
];

export const customTheme = createTheme({
  colors: {
    Blue1,
    Blue2,
    PaleBlue,
    PaleRed,
    DeepOrange,
    // c1: virtualColor({
    //   name: 'c1',
    //   light: 'deepBlue',
    //   dark: 'oceanBlue'
    // })
  },
  primaryColor: "DeepOrange",
});

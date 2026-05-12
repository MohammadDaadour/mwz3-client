"use server";

import { IAuthResponse } from "@/interfaces";
import axios from "axios";
import { cookies } from "next/headers";

export async function publicFetcher(url: string) {
  const res = await fetch(url);
  return res.json();
}

export async function privateFetcher(url: string) {
  const token = cookies().get("Auth")?.value;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Cookie: `Auth=${token};`,
    },
  });
  return res.json();
}

export async function isAuth() {
  const token = cookies().get("Auth")?.value;
  var result: IAuthResponse;

  try {
    const res = await axios.get(`${process.env.API_URL}/validate`, {
      withCredentials: true,
      headers: { Cookie: `Auth=${token}` },
    });
    result = { success: true, status: res.status, meta: res.data };
    return result;
  } catch (err: any) {
    result = {
      success: false,
      status: err?.response?.status,
      meta: err?.response?.data?.message,
    };
    return result;
  }
}

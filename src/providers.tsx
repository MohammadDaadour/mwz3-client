"use client";

import { ReactNode, createContext, useEffect, useState } from "react";
import { isAuth } from "./libs/functions";

type Props = {
  children: ReactNode;
};

interface IUser {
  id: number;
  role: string;
  name: string;
  image: number;
  country: number;
}

interface IAppContext {
  country: number;
  user: IUser;
  setContextCountry: (val: number) => void;
  setContextUser: () => void;
}

export const AppContext = createContext<IAppContext>({
  country: 3,
  user: { id: 0, role: "", name: "", image: 0, country: 0 },
  setContextCountry: (val: number) => {},
  setContextUser: () => {},
});

export function AppProvider({ children }: Props) {
  const [country, setCountry] = useState<number>(3);
  const [user, setUser] = useState<IUser>({ id: 0, role: "", name: "", image: 0, country: 0 });

  async function fetchUser() {
    const auth = await isAuth();
    if (auth && auth.success) {
      setUser({ id: auth.meta.id, role: auth.meta.role, name: auth.meta.name, image: auth.meta.image, country: auth.meta.country });
    } else {
      setUser({ id: 0, role: "", name: "", image: 0, country: 0 });
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const storedCountry = localStorage.getItem("country");
    if (storedCountry) {
      setCountry(JSON.parse(storedCountry));
    } else {
      setCountry(3);
      localStorage.setItem("country", JSON.stringify(3));
    }
  }, []);

  function setContextCountry(val: number) {
    setCountry(val);
    localStorage.setItem("country", JSON.stringify(val));
  }

  function setContextUser() {
    fetchUser();
  }

  return (
    <AppContext.Provider value={{ country, user, setContextCountry, setContextUser }}>{children}</AppContext.Provider>
  );
}

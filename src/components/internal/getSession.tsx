"use client";
import { useSession } from "@/state/atoms";
import React, { useEffect } from "react";

type Props = {
  sessionInfo: any;
};
export const GetSession = ({ sessionInfo }: Props) => {
  const { setUser } = useSession();

  useEffect(() => {
    setUser(sessionInfo);
  }, [sessionInfo]);

  return <></>;
};

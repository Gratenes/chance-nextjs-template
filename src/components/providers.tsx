"use client";

import * as React from "react";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Popover } from "@/components/ui/popover";

type Props = {
  children?: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <>
      <Toaster />
      <Popover />
      <ThemeProvider
        attribute="class"
        enableSystem
        defaultTheme="white"
        disableTransitionOnChange
      >
          {children}
      </ThemeProvider>
    </>
  );
};

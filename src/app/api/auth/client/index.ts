"use client";

import {signInWithProvider} from "@/app/api/auth/client/callbacks/signin";
import {signOutAndReload} from "@/app/api/auth/client/callbacks/signout";

export const signIn = signInWithProvider
export const signOut = signOutAndReload
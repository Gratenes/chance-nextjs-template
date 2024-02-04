"use client";
import {Button} from "react-aria-components";
import { signIn } from "@/app/api/auth/client"

export default async function () {
  return (
      <div className={'flex grow flex-col items-center justify-center'}>
        <Button onPress={() => signIn('discord', {
          redirect_url: '/'
        })}>Sign In With Discord</Button>
      </div>
  );
}
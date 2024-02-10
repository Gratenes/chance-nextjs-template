"use client";
import {Button, FieldError, Input, Label, TextField} from "react-aria-components";
import {signIn} from "@/app/api/auth/client"
import {FormEvent, useState} from "react";

export default function () {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitCheckUsername = (
  ) => {
    console.log({
      email,
      password
    });
    signIn('smtp', {
      email: email,
      password: password
    })
  }

  return (
    <div className={'flex grow flex-col items-center justify-center'}>
      <Button onPress={() => signIn('discord', {
        redirect_url: '/'
      })}>Sign In With Discord</Button>
      <div className={'h-1 w-full max-w-[200px] bg-white'}></div>
      <div>
          <TextField name="email" type="email" isRequired>
            <Label>Email</Label>
            <Input onChange={(e) => setEmail(e.target.value)} value={email} className={'bg-black'}/>
            <FieldError/>
          </TextField>
          <TextField name="password" type="password" isRequired minLength={8}>
            <Label>Password</Label>
            <Input onChange={(e) => setPassword(e.target.value)} value={password}/>
            <FieldError/>
          </TextField>
          <Button type="submit" onPress={() => submitCheckUsername()}>Submit</Button>
      </div>
    </div>
  );
}
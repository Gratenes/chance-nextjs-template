"use client";
// @flow 
import * as React from 'react';
import { RecoilRoot } from 'recoil';
type Props = { 
    children?: React.ReactNode 
};

// TODO: Add providers here!!!

export const Providers = ({ children }: Props) => {
    return (
        <RecoilRoot>
            {children}
        </RecoilRoot>
    );
};
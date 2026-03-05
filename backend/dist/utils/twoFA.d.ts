export declare const generate2FASecret: (email: string) => Promise<{
    secret: string;
    qrCode: string;
}>;
export declare const verify2FAToken: (secret: string, token: string) => boolean;
//# sourceMappingURL=twoFA.d.ts.map
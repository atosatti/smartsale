import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
export const generate2FASecret = async (email) => {
    const secret = speakeasy.generateSecret({
        name: `SmartSale (${email})`,
        issuer: 'SmartSale',
        length: 32,
    });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    return {
        secret: secret.base32,
        qrCode,
    };
};
export const verify2FAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
    });
};
//# sourceMappingURL=twoFA.js.map
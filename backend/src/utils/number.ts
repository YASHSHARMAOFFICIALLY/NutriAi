export const roundToTenth = (value: number): number => Math.round(value * 10) / 10;

export const scaleToTenth = (value: number, scale: number): number => roundToTenth(value * scale);

export const roundMoney = (value: number): number => Math.round(value * 10_000) / 10_000;

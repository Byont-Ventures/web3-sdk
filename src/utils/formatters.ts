import { Decimal } from 'decimal.js';
import { BigNumberish } from 'ethers';
import {
  formatUnits as ethersFormatUnits,
  formatEther as ethersFormatEther,
} from 'ethers/lib/utils';

export const truncateAddress = (str: string) =>
  `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;

export const formatUnits = (
  value: BigNumberish,
  unitName?: BigNumberish | undefined,
  rounding = 8
) =>
  new Decimal(ethersFormatUnits(value, unitName))
    .mul(10 ** rounding)
    .round()
    .div(10 ** rounding)
    .toString();

export const formatEther = (value: BigNumberish, rounding = 8) =>
  new Decimal(ethersFormatEther(value))
    .mul(10 ** rounding)
    .round()
    .div(10 ** rounding)
    .toString();

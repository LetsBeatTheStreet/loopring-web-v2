import { TradeBtnStatus } from '../Interface';
import { InputButtonProps } from '../../basic-lib';
import { CoinInfo, TradeCalcProData } from '@loopring-web/common-resources';
import React from 'react';

export enum TradeProType {
    sell='sell' ,
    buy='buy'
}
export enum TradeBaseType {
    price='price' ,
    quote='quote' ,
    base='base',
    tab='tab',
    slippage='slippage'
}

export type TradeLimitInfoProps<T,TCD extends TradeCalcProData<I>,I> = {
    tradeLimitI18nKey?: string,
    tradeLimitBtnStyle?: React.CSSProperties,
    tradeCalcProData: Partial<TCD>,
    tradeLimitBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    tokenPriceProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenBaseProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenQuoteProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
}

export type TradeMarketInfoProps<T,TCD extends TradeCalcProData<I>,I> = {
    tradeMarketI18nKey?: string,
    tradeMarketBtnStyle?: React.CSSProperties,
    tradeCalcProData: Partial<TCD>,
    tradeMarketBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    tokenBaseProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenQuoteProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
}

export type TradeProBaseEventProps<X,T, I> = {
    disabled?: boolean,
    tradeType:  TradeProType,
    handleChangeIndex?: (index: TradeProType) => X,
    // onSwapClick: (tradeData: SwapTradeData<T>) => void | any,
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>


export type TradeCommonProps<X,T,TCD,I> = {
    type:'limit'|'market',
    tradeData: X ,
    i18nKey: string,
    tradeCalcProData: TCD,
    onChangeEvent: (data: X,formType:TradeBaseType) =>  X,
    tradeBtnBaseStatus?: keyof typeof TradeBtnStatus | undefined,
    handleCountChange?:(ibData: T,name:string, ref: React.ForwardedRef<any>) => void,
    // tokenPriceProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenBaseProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenQuoteProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
}

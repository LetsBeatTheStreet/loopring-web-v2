import { WithTranslation, withTranslation } from 'react-i18next';
import { MarketTradeData, TradeBaseType, TradeBtnStatus, TradeMarketProps } from '../Interface';
import _ from 'lodash'
import {
    CoinInfo,
    CoinKey,
    CoinMap,
    EmptyValueTag,
    getValuePrecisionThousand,
    IBData,
    SlippageTolerance,
    TradeCalcProData
} from '@loopring-web/common-resources';
import { TradeProType } from './Interface';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { BtnPercentage, InputCoin, LinkActionStyle, PopoverPure } from '../../basic-lib';
import { useCommon } from './hookCommon';
import { ButtonStyle } from '../components/Styled';
import { bindHover, bindPopover } from 'material-ui-popup-state/es';
import { SlippagePanel } from '../components';
import React from 'react';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { useSettings } from '../../../stores';

export const MarketTrade = withTranslation('common', {withRef: true})(<M extends MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>, I = CoinKey<any>>(
    {tradeData = {} as M, ...props}: TradeMarketProps<M, T, TCD, I> & WithTranslation
) => {
    // const {slippage} = useSettings();
    // onChangeEvent?: (data:L,type:TradeProType) => L,
    const {slippage} = useSettings();
    const slippageArray: Array<number | string> = SlippageTolerance.concat(`slippage:${slippage}`) as Array<number | string>;
    const {
        t,
        // disabled,
        tradeMarketI18nKey,
        // tradeCalcProData,
        tradeMarketBtnStatus,
        // handleCountChange,
        // tokenBaseProps,
        // tokenQuoteProps,
        // tradeData,
        // handleError,
        // handleSubmitEvent,
        // handleChangeIndex,
        onChangeEvent,
        // ...rest
    } = props
    const _handleCountChange = React.useCallback((ibData: IBData<I>, _ref: any) => {
        if (ibData) {

        }
    }, [tradeData]);

    const {
        quoteRef,
        baseRef,
        btnLabel,
        getDisabled,
        _handleChangeIndex,
        inputError,
        tabIndex,
        tradeCalcProData,
        tradeBtnBaseStatus,
        propsBase,
        propsQuote,
        onPercentage,
        selectedPercentage,
    } = useCommon({
        ...props as any,
        tradeData,
        handleCountChange: _handleCountChange,
        onChangeEvent,
        i18nKey: tradeMarketI18nKey ? tradeMarketI18nKey : 'labelProMarketBtn',
        tradeBtnBaseStatus: tradeMarketBtnStatus
    })
    const popupState = usePopupState({
        variant: 'popover',
        popupId: 'slippagePop',
    })
    const _onSlippageChange = React.useCallback((slippage: number | string, customSlippage: number | string | undefined) => {
        popupState.close();
        onChangeEvent({
            ...tradeData,
            slippage: slippage,
            __cache__: {
                ...tradeData.__cache__,
                customSlippage: customSlippage
            }
        }, TradeBaseType.slippage);
    }, [tradeData, onChangeEvent])
    const priceImpactColor = tradeCalcProData?.priceImpactColor ? tradeCalcProData.priceImpactColor : 'textPrimary'
    const priceImpact = tradeCalcProData?.priceImpact ? getValuePrecisionThousand(tradeCalcProData.priceImpact) + ' %' : EmptyValueTag

    const fee = (tradeCalcProData && tradeCalcProData.fee) ? ((parseFloat(tradeCalcProData.fee) / 100).toString() + '%') : EmptyValueTag

    const minimumReceived = tradeCalcProData && tradeCalcProData.minimumReceived ? tradeCalcProData.minimumReceived : EmptyValueTag

    return <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
        <Box className={'tool-bar'} paddingTop={2} paddingX={2} display={'flex'} alignItems={'center'}
             justifyContent={'center'}>
            <Box component={'header'} width={'100%'}>
                <Tabs variant={'fullWidth'} value={tabIndex}
                      onChange={(_e, index) => _handleChangeIndex(index)} className={'pro-tabs'}>
                    <Tab value={TradeProType.sell} label={t('labelProSell')}/>
                    <Tab value={TradeProType.buy} label={t('labelProBuy')}/>
                </Tabs>
            </Box>
        </Box>
        <Box className={'trade-panel'} paddingTop={2} paddingX={2}>
            <Box paddingTop={2}>
                <InputCoin<any, I, CoinInfo<I>> ref={baseRef as any} name={'base'} disabled={getDisabled()} {...{
                    ...propsBase,
                    // maxAllow:false,
                    isHideError: true,
                    inputData: tradeData ? tradeData.base : {} as any,
                    coinMap: tradeCalcProData && tradeCalcProData.coinInfoMap ? tradeCalcProData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
                }} />
            </Box>
            {/*</Grid>*/}
            {/*<Grid item>*/}
            <Box alignSelf={"center"} paddingTop={4} paddingX={1}>
               <BtnPercentage step={25} valueLabelDisplay={'on'} selected={selectedPercentage} anchors={[{
                   value: 0, label: ''
               }, {
                   value: 25, label: ''
               }, {
                   value: 50, label: ''
               }, {
                   value: 75, label: ''
               }, {
                   value: 100, label:''
               }]} handleChanged={onPercentage}  />
            </Box>
            <Box paddingTop={2}>
                <InputCoin<any, I, CoinInfo<I>> ref={quoteRef} name={'quote'} disabled={getDisabled()}  {...{
                    ...propsQuote,
                    isHideError: true,
                    inputData: tradeData ? tradeData.quote : {} as any,
                    coinMap: tradeCalcProData && tradeCalcProData.coinInfoMap ? tradeCalcProData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
                }} />
            </Box>
            {/*</Grid>*/}
            {/*<Grid item>*/}

            {/*< label={tradeCalcProData.baseToken} coinMap={tradeCalcProData.coinMap} />*/}
        </Box>
        <Box paddingTop={2} paddingX={2}>
            <Grid container direction={"column"} spacing={1} alignItems={"stretch"}>
                <Grid item paddingBottom={3} sx={{color: 'text.secondary'}}>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
                          height={24}>

                        <Typography component={'p'} variant="body2"
                                    color={'textSecondary'}>{t('swapTolerance')}</Typography>
                        <Typography component={'p'} variant="body2">
                            {tradeCalcProData ? <>
                                <Typography {...bindHover(popupState)}
                                            component={'span'} color={'textPrimary'}>
                                    <LinkActionStyle>
                                        {tradeData.slippage ? tradeData.slippage : tradeCalcProData.slippage ? tradeCalcProData.slippage : 0.5}%
                                    </LinkActionStyle>
                                    <PopoverPure
                                        className={'arrow-right'}
                                        {...bindPopover(popupState)}
                                        {...{
                                            anchorOrigin: {vertical: 'bottom', horizontal: 'right'},
                                            transformOrigin: {vertical: 'top', horizontal: 'right'}
                                        }}
                                    >
                                        <SlippagePanel {...{
                                            t,
                                            handleChange: _onSlippageChange,
                                            slippageList: slippageArray,
                                            slippage: tradeData.slippage ? tradeData.slippage : tradeCalcProData.slippage ? tradeCalcProData.slippage : 0.5
                                        }} />
                                    </PopoverPure>
                                </Typography>
                            </> : EmptyValueTag

                            }
                        </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
                          marginTop={1 / 2}>
                        <Typography component={'p'} variant="body2"
                                    color={'textSecondary'}> {t('swapPriceImpact')}</Typography>
                        <Typography component={'p'} color={priceImpactColor}
                                    variant="body2"> {priceImpact}  </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
                          marginTop={1 / 2}>
                        <Typography component={'p'} variant="body2"
                                    color={'textSecondary'}> {t('swapMinReceive')}</Typography>
                        <Typography component={'p'}
                                    variant="body2" color={'textPrimary'}>
                            {minimumReceived !== EmptyValueTag ? getValuePrecisionThousand(minimumReceived) : EmptyValueTag} </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
                          marginTop={1 / 2}>
                        <Typography component={'p'} variant="body2"
                                    color={'textSecondary'}> {t('swapFee')} </Typography>
                        <Typography component={'p'}
                                    variant="body2" color={'textPrimary'}>{fee}</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
        <Box paddingTop={2} paddingX={2}>
            <ButtonStyle variant={'contained'} size={'medium'}
                         color={tabIndex === TradeProType.sell ? 'success' : 'error'} onClick={() => {
                // onSwapClick(swapData.tradeData)
            }}
                         loading={!getDisabled() && tradeBtnBaseStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                         disabled={getDisabled() || tradeBtnBaseStatus === TradeBtnStatus.DISABLED || tradeBtnBaseStatus === TradeBtnStatus.LOADING || inputError.error}
                         fullWidth={true}>
                {btnLabel}
            </ButtonStyle>
        </Box>
    </Box>
}) as <M extends MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>, I = CoinKey<any>>(props: TradeMarketProps<M, T, TCD, I>) => JSX.Element

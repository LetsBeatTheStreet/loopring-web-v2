import React, { useState } from "react";
import { AmmData, AmmInData, CoinInfo, globalSetup, IBData } from '@loopring-web/common-resources';
import { AmmPanelType } from '@loopring-web/component-lib';
import { IdMap, useTokenMap } from '../../../stores/token';
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import { accountStaticCallBack, ammPairInit, bntLabel, btnClickMap, fnType, makeCache } from '../../../hooks/help';
import { WalletMap } from '@loopring-web/common-resources';
import * as sdk from 'loopring-sdk';
import {
    AmmPoolRequestPatch,
    AmmPoolSnapshot,
    ChainId,
    dumpError400,
    ExitAmmPoolRequest,
    GetAmmPoolSnapshotRequest,
    getExistedMarket,
    GetNextStorageIdRequest,
    GetOffchainFeeAmtRequest,
    JoinAmmPoolRequest,
    LoopringMap,
    makeExitAmmPoolRequest,
    makeJoinAmmPoolRequest,
    MarketInfo,
    OffchainFeeInfo,
    OffchainFeeReqType,
    TickerData,
    toBig,
    TokenInfo
} from 'loopring-sdk';
import { useCustomDCEffect } from '../../../hooks/common/useCustomDCEffect';
import { useAccount } from '../../../stores/account/hook';
import store, { RootState } from "stores";
import { LoopringAPI } from "stores/apis/api";
import { debounce } from "lodash";
import { AccountStatus } from "state_machine/account_machine_spec";
import { Lv2Account } from "defs/account_defs";
import { deepClone } from '../../../utils/obj_tools';
import { useWalletLayer2 } from "stores/walletLayer2";
import { myLog } from "utils/log_tools";
import { BIG10 } from "defs/swap_defs";
import { useSelector } from "react-redux";
import { REFRESH_RATE_SLOW } from "defs/common_defs";
import { useTranslation } from "react-i18next";

export const useAmmPanel = <C extends { [ key: string ]: any }>({
                                                                    pair,
                                                                    walletMap,
                                                                    ammType,
                                                                    snapShotData,
                                                                }
                                                                    : {
    pair: { coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined },
    snapShotData: { tickerData: TickerData | undefined, ammPoolsBalance: AmmPoolSnapshot | undefined } | undefined
    walletMap: WalletMap<C>
    ammType: keyof typeof AmmPanelType
}) => {

    const [ammToastOpen, setAmmToastOpen] = useState<boolean>(false)
    const [ammAlertText, setAmmAlertText] = useState<string>()

    const { t } = useTranslation('common')

    // const walletLayer2State = useWalletLayer2();
    const {coinMap, tokenMap} = useTokenMap();
    const {ammMap} = useAmmMap();
    const {account} = useAccount();
    const {delayAndUpdateWalletLayer2} = useWalletLayer2();
    const [ammCalcData, setAmmCalcData] = React.useState<AmmInData<C> | undefined>();

    const [ammJoinData, setAmmJoinData] = React.useState<AmmData<IBData<C>, C>>({
        coinA: {belong: undefined} as unknown as IBData<C>,
        coinB: {belong: undefined} as unknown as IBData<C>,
        slippage: 0.5
    } as AmmData<IBData<C>, C>);

    const [ammExitData, setAmmExitData] = React.useState({
        coinA: {belong: undefined} as unknown as IBData<C>,
        coinB: {belong: undefined} as unknown as IBData<C>,
        slippage: 0.5
    } as AmmData<IBData<C>, C>);

    const [ammDepositBtnI18nKey, setAmmDepositBtnI18nKey] = React.useState<string | undefined>(undefined);
    const [ammWithdrawBtnI18nKey, setAmmWithdrawBtnI18nKey] = React.useState<string | undefined>(undefined);

    const initAmmData = React.useCallback(async (pair: any) => {
        // @ts-ignore
        let _ammCalcData: Partial<AmmInData<C>> = ammPairInit(
            {
                pair,
                ammType,
                _ammCalcData: {},
                tokenMap,
                coinMap,
                walletMap: walletMap, //walletLayer2State.walletLayer2,
                ammMap,
                tickerData: snapShotData?.tickerData,
                ammPoolsBalance: snapShotData?.ammPoolsBalance
            })

        setAmmCalcData({...ammCalcData, ..._ammCalcData} as AmmInData<C>);
        if (_ammCalcData.myCoinA) {
            setAmmJoinData({
                coinA: {..._ammCalcData.myCoinA, tradeValue: undefined} as IBData<C>,
                coinB: {..._ammCalcData.myCoinB, tradeValue: undefined} as IBData<C>,
                slippage: 0.5
            })
            setAmmExitData({
                coinA: {..._ammCalcData.lpCoinA, tradeValue: undefined} as IBData<C>,
                coinB: {..._ammCalcData.lpCoinB, tradeValue: undefined} as IBData<C>,
                slippage: 0.5
            })
        }
    }, [snapShotData, walletMap, ammJoinData, ammExitData])

    const [ammPoolSnapshot, setAmmPoolSnapShot] = useState<AmmPoolSnapshot>()

    useCustomDCEffect(async() => {

        const updateAmmPoolSnapshot = async() => {

            if (!pair.coinAInfo?.simpleName || !pair.coinBInfo?.simpleName || !LoopringAPI.ammpoolAPI) {
                setAmmAlertText(t('labelAmmJoinFailed'))
                return
            }

            const {marketArray, marketMap,} = store.getState().tokenMap

            const {ammMap} = store.getState().amm.ammMap

            const {market, amm} = getExistedMarket(marketArray, pair.coinAInfo.simpleName as string,
                pair.coinBInfo.simpleName as string)

            if (!market || !amm || !marketMap) {
                return
            }

            const ammInfo: any = ammMap[ amm as string ]

            const request1: GetAmmPoolSnapshotRequest = {
                poolAddress: ammInfo.address
            }

            const response = await LoopringAPI.ammpoolAPI.getAmmPoolSnapshot(request1)

            if (!response) {
                return
            }

            const { ammPoolSnapshot } = response

            setAmmPoolSnapShot(ammPoolSnapshot)
        }

        await updateAmmPoolSnapshot()

        const handler = setInterval(async() => {

            updateAmmPoolSnapshot()

        }, REFRESH_RATE_SLOW)

        return () => {
            if (handler) {
                clearInterval(handler)
            }
        }

    }, [pair, LoopringAPI.ammpoolAPI])

    // set fees

    const [joinFees, setJoinFees] = useState<LoopringMap<OffchainFeeInfo>>()
    const [exitFees, setExitfees] = useState<LoopringMap<OffchainFeeInfo>>()

    const { status } = useSelector((state: RootState) => state.account)

    useCustomDCEffect(async () => {
        if (!LoopringAPI.userAPI || !pair.coinBInfo?.simpleName
            || status !== AccountStatus.ACTIVATED
             || !ammCalcData || !tokenMap) {
            return
        }

        const feeToken: TokenInfo = tokenMap[pair.coinBInfo.simpleName]

        const acc = store.getState().account

        const requestJoin: GetOffchainFeeAmtRequest = {
            accountId: acc.accountId,
            requestType: OffchainFeeReqType.AMM_JOIN,
            tokenSymbol: pair.coinBInfo.simpleName as string,
        }

        const {fees: feesJoin} = await LoopringAPI.userAPI.getOffchainFeeAmt(requestJoin, acc.apiKey)
        setJoinFees(feesJoin)

        const feeJoin = sdk.toBig(feesJoin[pair.coinBInfo.simpleName].fee as string).div(BIG10.pow(feeToken.decimals)).toString()
                    + ' ' + pair.coinBInfo.simpleName

        const requestExit: GetOffchainFeeAmtRequest = {
            accountId: acc.accountId,
            requestType: OffchainFeeReqType.AMM_EXIT,
            tokenSymbol: pair.coinBInfo.simpleName as string,
        }

        const {fees: feesExit} = await LoopringAPI.userAPI.getOffchainFeeAmt(requestExit, acc.apiKey)

        setExitfees(feesExit)

        const feeExit = sdk.toBig(feesExit[pair.coinBInfo.simpleName].fee as string).div(BIG10.pow(feeToken.decimals)).toString()
                    + ' ' + pair.coinBInfo.simpleName

        myLog('-> feeJoin:', feeJoin, ' feeExit:', feeExit)

        setAmmCalcData({ ...ammCalcData, feeJoin, feeExit })

    }, [LoopringAPI.userAPI, pair.coinBInfo?.simpleName, ammCalcData, status, tokenMap])

    // join

    const [joinRequest, setJoinRequest] = useState<{ ammInfo: any, request: JoinAmmPoolRequest }>()

    const handlerJoinInDebounce = React.useCallback(debounce(async (data, type, joinFees, ammPoolSnapshot) => {


        if (!data || !tokenMap || !data.coinA.belong || !data.coinB.belong || !ammPoolSnapshot || !joinFees) {
            return
        }

        myLog('handlerJoinInDebounce', data, type);

        const { slippage } = data

        const slippageReal = sdk.toBig(slippage).div(100).toString()

        const isAtoB = type === 'coinA'

        const acc: Lv2Account = store.getState().account

        const {idIndex, marketArray, marketMap,} = store.getState().tokenMap

        const {ammMap} = store.getState().amm.ammMap

        const {market, amm} = getExistedMarket(marketArray, data.coinA.belong as string,
            data.coinB.belong as string)

        if (!market || !amm || !marketMap) {
            return
        }

        const marketInfo: MarketInfo = marketMap[ market ]

        const ammInfo: any = ammMap[ amm as string ]

        const coinA = tokenMap[ data.coinA.belong as string ]
        const coinB = tokenMap[ data.coinB.belong as string ]

        const coinA_TV = ammPoolSnapshot.pooled[ 0 ]
        const coinB_TV = ammPoolSnapshot.pooled[ 1 ]

        const covertVal = data.coinA.tradeValue ? sdk.toBig(data.coinA.tradeValue)
            .times('1e' + isAtoB ? coinA.decimals : coinB.decimals).toFixed(0, 0) : '0'
        const {output, ratio} = sdk.ammPoolCalc(covertVal, isAtoB, coinA_TV, coinB_TV)
        const rawA = data.coinA.tradeValue ? data.coinA.tradeValue.toString() : 0;
        const rawB = data.coinB.tradeValue ? data.coinB.tradeValue.toString() : 0;
        const rawVal = isAtoB ? rawA : rawB;

        const {request} = makeJoinAmmPoolRequest(rawVal,
            isAtoB, slippageReal, acc.accAddr, joinFees as LoopringMap<OffchainFeeInfo>,
            ammMap[ amm ], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0, 0)

        if (isAtoB) {
            data.coinB.tradeValue = parseFloat(toBig(request.joinTokens.pooled[ 1 ].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            data.coinA.tradeValue = parseFloat(toBig(request.joinTokens.pooled[ 0 ].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        setAmmJoinData({
            coinA: data.coinA as IBData<C>,
            coinB: data.coinB as IBData<C>,
            slippage: slippage
        })

        setJoinRequest({
            ammInfo,
            request
        })
        // }

    }, globalSetup.wait), [])

    const handleJoinAmmPoolEvent = React.useCallback(async (data: AmmData<IBData<C>>, type: 'coinA' | 'coinB') => {
        await handlerJoinInDebounce(data, type, joinFees, ammPoolSnapshot)
    }, [joinFees, ammPoolSnapshot]);

    const addToAmmCalculator = React.useCallback(async function (props
    ) {

        setJoinLoading(true)
        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !joinRequest) {
            myLog(' onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'joinRequest:', joinRequest)

            setAmmAlertText(t('labelJoinAmmFailed'))
            setAmmToastOpen(true)

            setJoinLoading(false)
            return
        }

        //todo add loading

        const acc: Lv2Account = store.getState().account

        const {ammInfo, request} = joinRequest

        const patch: AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: acc.eddsaKey
        }

        try {

            const request2: GetNextStorageIdRequest = {
                accountId: acc.accountId,
                sellTokenId: request.joinTokens.pooled[ 0 ].tokenId as number
            }
            const storageId0 = await LoopringAPI.userAPI.getNextStorageId(request2, acc.apiKey)

            const request_1: GetNextStorageIdRequest = {
                accountId: acc.accountId,
                sellTokenId: request.joinTokens.pooled[ 1 ].tokenId as number
            }
            const storageId1 = await LoopringAPI.userAPI.getNextStorageId(request_1, acc.apiKey)

            request.storageIds = [storageId0.offchainId, storageId1.offchainId]
            setAmmJoinData({
                ...ammJoinData, ...{
                    coinA: {...ammJoinData.coinA, tradeValue: 0},
                    coinB: {...ammJoinData.coinB, tradeValue: 0},
                }
            })
            const response = await LoopringAPI.ammpoolAPI.joinAmmPool(request, patch, acc.apiKey)

            myLog('join ammpool response:', response)

            await delayAndUpdateWalletLayer2()

            setAmmAlertText(t('labelJoinAmmSuccess'))

        } catch (reason) {

            dumpError400(reason)

            setAmmAlertText(t('labelJoinAmmFailed'))
        }
        finally {
            setAmmToastOpen(true)
            setJoinLoading(false)
        }
        if (props.__cache__) {
            makeCache(props.__cache__)
        }
    }, [joinRequest, ammJoinData])

    const onAmmDepositClickMap: typeof btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]: [addToAmmCalculator]
    })
    const onAmmAddClick = React.useCallback((props: AmmData<IBData<C>>) => {
        accountStaticCallBack(onAmmDepositClickMap, [props])
    }, [onAmmDepositClickMap]);

    // exit
    const [exitRequest, setExitRequest] = useState<{ rawVal: '', ammInfo: any, request: ExitAmmPoolRequest }>()

    // const handler = React.useCallback(async () =>,[])
    const handleExitInDebounce = React.useCallback(debounce(async (data, type, exitFees, ammPoolSnapshot) => {

        if (!tokenMap || !data.coinA.belong || !data.coinB.belong || !ammPoolSnapshot || !exitFees) {
            return
        }

        myLog('handleExitInDebounce', data, type);

        const isAtoB = type === 'coinA'

        const acc: Lv2Account = store.getState().account

        const {idIndex, marketArray, marketMap,} = store.getState().tokenMap

        const {ammMap} = store.getState().amm.ammMap

        const {market, amm} = getExistedMarket(marketArray, data.coinA.belong as string,
            data.coinB.belong as string)

        if (!market || !amm || !marketMap) {
            return
        }

        const marketInfo: MarketInfo = marketMap[ market ]

        const ammInfo: any = ammMap[ amm as string ]

        const coinA = tokenMap[ data.coinA.belong as string ]
        const coinB = tokenMap[ data.coinB.belong as string ]

        const coinA_TV = ammPoolSnapshot.pooled[ 0 ]
        const coinB_TV = ammPoolSnapshot.pooled[ 1 ]

        const covertVal = data.coinA.tradeValue ? sdk.toBig(data.coinA.tradeValue)
            .times('1e' + isAtoB ? coinA.decimals : coinB.decimals).toFixed(0, 0) : '0'
        const {output, ratio} = sdk.ammPoolCalc(covertVal, isAtoB, coinA_TV, coinB_TV)

        const rawVal = isAtoB ? data.coinA.tradeValue.toString() : data.coinB.tradeValue.toString()

        const {request} = makeExitAmmPoolRequest(rawVal, isAtoB, '0.001', acc.accAddr, exitFees as LoopringMap<OffchainFeeInfo>,
            ammMap[ amm ], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0)

        if (isAtoB) {
            data.coinB.tradeValue = parseFloat(toBig(request.exitTokens.unPooled[ 1 ].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            data.coinA.tradeValue = parseFloat(toBig(request.exitTokens.unPooled[ 0 ].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        setAmmExitData({
            coinA: data.coinA as IBData<C>,
            coinB: data.coinB as IBData<C>,
            slippage: 0.5
        })

        setExitRequest({
            rawVal,
            ammInfo,
            request,
        })
        // }

    }, globalSetup.wait), [])

    const handleExitAmmPoolEvent = React.useCallback(async (data: AmmData<IBData<C>>, type: 'coinA' | 'coinB') => {
        await handleExitInDebounce(data, type, exitFees, ammPoolSnapshot)
    }, [exitFees, ammPoolSnapshot]);

    useCustomDCEffect(() => {

        const label: string | undefined = accountStaticCallBack(bntLabel)
        setAmmDepositBtnI18nKey(label);
        setAmmWithdrawBtnI18nKey(label)
    }, [account.status, bntLabel])

    const [isJoinLoading, setJoinLoading] = useState(false)

    const [isExitLoading, setExitLoading] = useState(false)

    const removeAmmCalculator = React.useCallback(async function (props
    ) {
        setExitLoading(true);
        //TODO: onExit
        myLog('removeAmmCalculator props:', props)

        // const { exitRequest } = props

        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !exitRequest) {
            myLog(' onExit ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'exitRequest:', exitRequest)
                
            setAmmAlertText(t('labelExitAmmFailed'))
            setAmmToastOpen(true)
    
            setExitLoading(false);
            return
        }

        const acc: Lv2Account = store.getState().account

        const {ammInfo, request} = exitRequest

        const patch: AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: acc.eddsaKey
        }

        const burnedReq: GetNextStorageIdRequest = {
            accountId: acc.accountId,
            sellTokenId: request.exitTokens.burned.tokenId as number
        }
        const storageId0 = await LoopringAPI.userAPI.getNextStorageId(burnedReq, acc.apiKey)

        request.storageId = storageId0.offchainId

        try {

            myLog('exit req:', request)
            setAmmExitData({
                ...ammExitData, ...{
                    coinA: {...ammExitData.coinA, tradeValue: 0},
                    coinB: {...ammExitData.coinB, tradeValue: 0},
                }
            })
            const response = await LoopringAPI.ammpoolAPI.exitAmmPool(request, patch, acc.apiKey)

            myLog('exit ammpool response:', response)

            await delayAndUpdateWalletLayer2()

            setAmmAlertText(t('labelExitAmmSuccess'))
        } catch (reason) {
            dumpError400(reason)
            setAmmAlertText(t('labelExitAmmFailed'))
        } finally {
            setAmmToastOpen(true)
            setExitLoading(false)
        }

        // if (props.__cache__) {
        //     makeCache(props.__cache__)
        // }

    }, [exitRequest, ammExitData])

    const removeAmmClickMap: typeof btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]: [removeAmmCalculator]
    })

    const onAmmRemoveClick = React.useCallback((props: AmmData<IBData<C>>) => {

        myLog('onAmmRemoveClick, exitRequest:', exitRequest, ' ammExitData:', ammExitData)
        accountStaticCallBack(removeAmmClickMap, [props])
    }, [exitRequest, ammExitData]);

    React.useEffect(() => {
        if (snapShotData) {
            initAmmData(pair)
        }
    }, [snapShotData, pair, walletMap]);

    return {
        ammAlertText,
        ammToastOpen,
        setAmmToastOpen,

        ammCalcData,
        ammJoinData,
        ammExitData,
        isJoinLoading,
        isExitLoading,
        handleJoinAmmPoolEvent,
        handleExitAmmPoolEvent,
        onAmmRemoveClick,
        onAmmAddClick,
        ammDepositBtnI18nKey,
        ammWithdrawBtnI18nKey,
    }
}
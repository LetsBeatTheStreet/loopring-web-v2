import store from '../stores';
import { AccountStep, setShowAccount, setShowConnect, Toast, WalletConnectStep } from '@loopring-web/component-lib';
import { fnType } from '@loopring-web/common-resources';
import { changeShowModel } from 'stores/account';
import { walletLayer2Services } from 'services/account/walletLayer2Services'
import { myLog } from 'utils/log_tools';

export const accountStaticCallBack = (onclickMap: { [key: number]: [fn: (props: any) => any, args?: any[]] }, deps?: any[]) => {
    const { readyState } = store.getState().account;
    // fnType[readyState]
    let fn, args;
    [fn, args] = onclickMap[readyState] ? onclickMap[readyState] : [];
    myLog('accountStaticCallBack:', readyState)
    if (typeof fn === 'function') {
        args = [...(args ?? []), ...(deps ?? [])] as [props: any]
        return fn.apply(this, args);
    }

}

export const btnLabel: typeof btnClickMap = {

    [fnType.UN_CONNECT]: [
        function () {
            return `labelConnectWallet`
        }
    ],
    [fnType.ERROR_NETWORK]: [
        function () {
            return `labelWrongNetwork`
        }
    ],

    [fnType.DEFAULT]: [
        function () {
            return `depositTitleAndActive`
        }
    ], [fnType.ACTIVATED]: [
        function () {
            return undefined
        }
    ]
    , [fnType.LOCKED]: [
        function () {
            return `labelUnLockLayer2`
        }
    ]
};


export const btnClickMap: { [key: string]: [fn: (props: any) => any, args?: any[]] } = {
    [fnType.ERROR_NETWORK]: [
        function () {
            //TODO toast
            return
        }
    ],
    [fnType.UN_CONNECT]: [
        function () {
            // setShowConnect({isShow: true})
            store.dispatch(changeShowModel({ _userOnModel: true }));
            store.dispatch(setShowConnect({ isShow: true, step: WalletConnectStep.Provider }))
        }
    ]
    , [fnType.NO_ACCOUNT]: [
        function () {
            store.dispatch(changeShowModel({ _userOnModel: true }));
            store.dispatch(setShowAccount({ isShow: true, step: AccountStep.NoAccount }))
            // ShowDeposit(true)
        }
    ]
    , [fnType.DEPOSITING]: [
        function () {
            walletLayer2Services.sendCheckAcc()
            // store.dispatch(setShowAccount({isShow: true, step: AccountStep.Depositing}))
            // ShowDeposit(true)
        }
    ]
    , [fnType.LOCKED]: [
        function () {
            store.dispatch(changeShowModel({ _userOnModel: true }));
            store.dispatch(setShowAccount({ isShow: true, step: AccountStep.HadAccount }))
        }
    ]
};


import { combineReducers } from '@reduxjs/toolkit';
import { confirmationSlice } from './confirmation';
import { favoriteMarketSlice } from './favoriteMarket';
import { OnChainHashInfoSlice } from './onchainHashInfo';
import { walletInfoSlice } from './walletInfo';

export const localStoreReducer = combineReducers({
    favoriteMarket: favoriteMarketSlice.reducer,
    chainHashInfos: OnChainHashInfoSlice.reducer,
    confirmation: confirmationSlice.reducer,
    walletInfo: walletInfoSlice.reducer,
})

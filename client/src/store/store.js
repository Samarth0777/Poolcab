import {configureStore} from '@reduxjs/toolkit'
import userReducer from './userSlice' 
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import {persistStore,persistReducer} from 'redux-persist'

//PERSISTENT-STORE.....................................

const persistConfig={
    key:'root',
    storage
}

const rootReducer=combineReducers({
    user:userReducer
})

const persistedReducer=persistReducer(persistConfig,rootReducer)

export const store=configureStore({
    reducer:persistedReducer
})

export const persistor = persistStore(store)



//NON-PERSISTENT STORE..............................

// export const store=configureStore({
//     reducer:{
//         user:userReducer
//     }
// })
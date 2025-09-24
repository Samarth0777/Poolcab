import { createSlice } from "@reduxjs/toolkit"

const initialState={
    user:{},
    allrides:[],
    bookedrides:[],
    postedrides:[],
    lang:'en'
}

const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
        setuser(state,action){
            state.user=action.payload
        },
        getallrides(state,action){
            state.allrides=action.payload
        },
        getbookedrides(state,action){
            state.bookedrides=action.payload
        },
        getpostedrides(state,action){
            state.postedrides=action.payload
        },
        changeLang(state,action){
            state.lang=action.payload
        }
    }
})

export const {setuser,getbookedrides,getpostedrides,getallrides,changeLang}=userSlice.actions
export default userSlice.reducer
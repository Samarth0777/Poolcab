import { Outlet } from "react-router-dom"
import Header from "./containers/Common/Header"

const AppLayout = () =>{
    return<>
        <div className="container">
            <div className="top-header">
                <Header/>
            </div>
            <div className="action">
                <Outlet/>
            </div>
        </div>
    </>
}

export default AppLayout
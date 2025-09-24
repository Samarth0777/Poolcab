import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/Header.css'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { changeLang, setuser } from '../../store/userSlice'

const Header = () => {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const redux_user=useSelector((state)=>state.user.user)
    const redux_lang=useSelector((state)=>state.user.lang)
    const dispatch=useDispatch()

    const toggleMenu = () => {
        setMenuOpen(!menuOpen)
    }

    const handleNavigate = (path) => {
        navigate(path)
        setMenuOpen(false)
    }

    const handle_lang_change=()=>{
        redux_lang==='en'?dispatch(changeLang('fr')):dispatch(changeLang('en'))
        console.log(redux_lang)
    }

    const handle_logout=()=>{
            localStorage.removeItem("token")
            localStorage.removeItem("username")
            localStorage.removeItem("i18nextLng")
            dispatch(setuser({}))
            toast.success("Logged out successfully")
            navigate('/login')
    }

    return (
        <div className="light-header-overlay">
            <div className="light-header-content">
                <div className="light-hamburger" onClick={toggleMenu}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>

                <div className={`light-main-actions ${menuOpen ? 'open' : ''}`}>
                    <p onClick={() => handleNavigate('/')}>Explore</p>
                    <p onClick={() => handleNavigate('/post')}>Post</p>
                    <p onClick={() => handleNavigate('/history')}>History</p>
                    <p onClick={() => handleNavigate('/profile')}>Profile</p>
                    {redux_user.isAdmin&&<p onClick={()=>{handleNavigate('/admin')}}>Admin</p>}
                    {/* <button onClick={handle_lang_change}>Change Lang</button> */}
                    {redux_user.isBlocked&&<button className='logout-btn' onClick={handle_logout}>Logout</button>}
                </div>
            </div>
        </div>
    )
}

export default Header

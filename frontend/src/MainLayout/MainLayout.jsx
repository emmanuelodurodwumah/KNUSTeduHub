
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import NavBar from '../Components/NavBar/NavBar'
import Footer from '../Components/Footer/Footer'
import Auth from '../Auth/Auth'
import Login from '../Auth/Login/Login'
import Register from '../Auth/Register/Register'
import Error from '../Pages/Error/Error'
import Home from '../Pages/Home/Home'
import AuthCheck from '../AuthCheck/AuthCheck'
import AdminCheck from '../AuthCheck/AdminCheck'
import About from '../Pages/About/About'
import Cart from '../Pages/Cart/Cart'
import Orders from '../Pages/Orders/Orders'
import CheckoutVerification from '../Pages/Checkout/CheckoutVerification'
import Admin from '../Pages/Admin/Admin'

const LayoutContent = () => {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminPage && <NavBar />}

        <Routes>
            <Route path='/admin' element={
              <AdminCheck>
                <Admin />
              </AdminCheck>
            } />
            <Route path='/cart' element={
              <Cart/>
            }/>
            <Route path='/payment-success' element={
              <CheckoutVerification/>
            }/>
            <Route path='/orders' element={
              <AuthCheck>
                <Orders/>
              </AuthCheck>
              
            }/>
            {/* <Route path='auth' element={<Auth/>} >
                <Route path='login' element={<Login/>} />
                <Route path='register' element={<Register/>} />
            </Route> */}

            <Route path='about' element={<About />} />
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* not found route */}
            <Route path='*' element={<Error/>} />
        </Routes>

      {!isAdminPage && <Footer />}
    </>
  )
}

const MainLayout = () => {
  return (
    <BrowserRouter>
      <LayoutContent />
    </BrowserRouter>
  )
}

export default MainLayout
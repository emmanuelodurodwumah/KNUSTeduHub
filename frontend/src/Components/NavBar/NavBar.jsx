import { useEffect, useRef, useState } from 'react'
import { Armchair, Menu, Search, ShoppingCart, User, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../services/authStore'
import useCartStore from '../../services/store'

const NavBar = () => {
    const itemCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0))
    const username = useAuthStore((state) => state.username)
    const accessToken = useAuthStore((state) => state.accessToken)
    const isAdmin = useAuthStore((state) => state.isAdmin)
    const adminStatusLoaded = useAuthStore((state) => state.adminStatusLoaded)
    const setAdminStatus = useAuthStore((state) => state.setAdminStatus)
    const logout = useAuthStore((state) => state.logout)
    const location = useLocation()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [accountMenuOpen, setAccountMenuOpen] = useState(false)
    const accountMenuRef = useRef(null)

    useEffect(() => {
        const closeAccountMenu = (event) => {
            if (!accountMenuRef.current?.contains(event.target)) {
                setAccountMenuOpen(false)
            }
        }
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setAccountMenuOpen(false)
        }

        document.addEventListener('click', closeAccountMenu)
        document.addEventListener('keydown', closeOnEscape)
        return () => {
            document.removeEventListener('click', closeAccountMenu)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [])

    useEffect(() => {
        if (!accessToken || adminStatusLoaded) return undefined
        let active = true
        api.get('users/me/')
            .then((response) => {
                if (active) setAdminStatus(Boolean(response.data.is_admin))
            })
            .catch((error) => {
                console.error('Unable to verify admin access:', error)
                if (active) setAdminStatus(false)
            })
        return () => {
            active = false
        }
    }, [accessToken, adminStatusLoaded, setAdminStatus])

    const handleSearch = (event) => {
        event.preventDefault()
        const query = String(new FormData(event.currentTarget).get('search') ?? '').trim()
        navigate(query ? `/?search=${encodeURIComponent(query)}` : '/')
    }

    const linkClass = ({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
            isActive ? 'text-[#029fae]' : 'text-[#636270] hover:bg-gray-50 hover:text-[#029fae]'
        }`

    return (
        <header className='w-full border-b border-[#e1e3e5] bg-white'>
            <div className='mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 md:py-4 lg:px-8'>
                <Link to='/' onClick={() => setMenuOpen(false)} className='flex min-w-0 items-center gap-2 text-xl font-semibold text-black sm:text-2xl'>
                    <Armchair size={30} className='shrink-0 text-[#029fae] sm:h-8 sm:w-8' />
                    <span className='truncate'>eduHub</span>
                </Link>

                <form
                    key={location.search}
                    onSubmit={handleSearch}
                    role='search'
                    className='relative order-3 col-span-2 h-10 w-full md:order-0 md:col-span-1 md:mx-auto md:max-w-md'
                >
                    <input
                        type='search'
                        name='search'
                        defaultValue={new URLSearchParams(location.search).get('search') ?? ''}
                        placeholder='Search products...'
                        aria-label='Search products'
                        className='h-full w-full rounded-lg border border-gray-200 bg-white pl-4 pr-11 text-sm outline-none transition focus:border-[#029fae] focus:ring-2 focus:ring-[#029fae]/15'
                    />
                    <button
                        type='submit'
                        aria-label='Submit product search'
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-[#272343]'
                    >
                        <Search size={20} />
                    </button>
                </form>

                <div className='flex items-center justify-end gap-1 sm:gap-3'>
                    <Link
                        to='/cart'
                        aria-label={`Shopping cart, ${itemCount} items`}
                        className='inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium capitalize text-slate-700 transition hover:bg-gray-50 sm:px-3'
                    >
                        <span className='relative'>
                            <ShoppingCart size={21} />
                            <span className='absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#029fae] px-1 text-[10px] font-bold text-white'>
                                {itemCount}
                            </span>
                        </span>
                        <span className='hidden sm:inline'>Cart</span>
                    </Link>

                    <div ref={accountMenuRef} className='relative'>
                        <button
                            type='button'
                            aria-label='Account menu'
                            aria-expanded={accountMenuOpen}
                            aria-controls='account-menu'
                            onClick={() => setAccountMenuOpen((open) => !open)}
                            className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-600 transition hover:bg-gray-50'
                        >
                            <User size={19} />
                        </button>
                        <ul
                            id='account-menu'
                            className={`${accountMenuOpen ? 'block' : 'hidden'} menu absolute right-0 top-full z-50 mt-2 w-52 rounded-box border border-gray-100 bg-base-100 p-2 shadow-lg`}
                        >
                            {username ? (
                                <>
                                    <li><span className='text-sm text-gray-500'>{username}</span></li>
                                    <li><button type='button' onClick={() => { logout(); setAccountMenuOpen(false) }}>Logout</button></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to='/login' onClick={() => setAccountMenuOpen(false)}>Login</Link></li>
                                    <li><Link to='/register' onClick={() => setAccountMenuOpen(false)}>Create account</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    <button
                        type='button'
                        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={menuOpen}
                        aria-controls='site-navigation'
                        onClick={() => setMenuOpen((open) => !open)}
                        className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-600 transition hover:bg-gray-50 md:hidden'
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            <nav
                id='site-navigation'
                aria-label='Main navigation'
                className={`${menuOpen ? 'block' : 'hidden'} border-t border-gray-100 px-4 py-2 md:block md:border-0 md:px-0 md:py-0`}
            >
                <div className='mx-auto flex max-w-7xl flex-col gap-1 pb-2 md:flex-row md:items-center md:gap-2 md:px-6 md:pb-3 lg:px-8'>
                    <NavLink end to='/' onClick={() => setMenuOpen(false)} className={linkClass}>Home</NavLink>
                    <NavLink to='/cart' onClick={() => setMenuOpen(false)} className={linkClass}>Cart</NavLink>
                    <NavLink to='/orders' onClick={() => setMenuOpen(false)} className={linkClass}>Orders</NavLink>
                    {isAdmin && <NavLink to='/admin' onClick={() => setMenuOpen(false)} className={linkClass}>Admin</NavLink>}
                    <NavLink to='/about' onClick={() => setMenuOpen(false)} className={linkClass}>About</NavLink>
                </div>
            </nav>
        </header>
    )
}

export default NavBar

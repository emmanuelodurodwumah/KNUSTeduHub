import { MoveRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../services/authStore'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const login = useAuthStore((state) => state.login)
  const location = useLocation()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await api.post('token/', { username, password })
      const { access, refresh } = response.data

      if (!access || !refresh) {
        throw new Error('The server did not return valid login tokens.')
      }

      login({ access, refresh, username })
      const destination = location.state?.from
      navigate(
        destination
          ? `${destination.pathname}${destination.search ?? ''}${destination.hash ?? ''}`
          : '/',
        { replace: true },
      )
    } catch (requestError) {
      console.error('Could not log in:', requestError)
      const detail = requestError.response?.data?.detail ?? requestError.response?.data?.message
      setError(
        typeof detail === 'string'
          ? detail
          : requestError.message ?? 'Unable to log in. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:container lg:px-8 lg:py-20'>

      <div className='mx-auto flex min-h-95.5 w-full max-w-162 flex-col items-center justify-center rounded-lg border border-[#9a9caa] p-5 sm:p-7.75'>

        <h3 className='mb-5 text-2xl font-semibold capitalize text-[#272343] sm:text-3xl'>Login</h3>

        <form onSubmit={handleSubmit} className='flex flex-col items-center w-full space-y-4'>
          <input
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder='Your Username...'
            aria-label="Username"
            className='h-12.5 w-full rounded-lg bg-[#f0f2f3] pl-3.5'
          />
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='Your Password...'
            aria-label="Password"
            className='h-12.5 w-full rounded-lg bg-[#f0f2f3] pl-3.5'
          />

          {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}

          <button
            type='submit'
            disabled={isSubmitting}
            className='flex h-12.5 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-[#007580] pl-3.5 text-base font-semibold capitalize text-white disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isSubmitting ? 'Logging in...' : 'Login'} <MoveRight />
          </button>
        </form>

        <p className='mt-4 flex flex-wrap items-center justify-center gap-2.5 text-center text-sm font-normal text-[#272343] sm:text-base'>Don't have an account 
        <Link to={'/register'} className='text-[#007580]'>Register</Link>  
        </p>

      </div>
    </div>
  )
}

export default Login
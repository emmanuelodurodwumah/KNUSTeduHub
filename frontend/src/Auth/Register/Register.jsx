import { useState } from 'react'
import { MoveRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('users/register_user/', form)
      setIsRegistered(true)
    } catch (requestError) {
      console.error('Could not register user:', requestError)
      const responseData = requestError.response?.data
      const detail = responseData?.detail ?? responseData?.message
      const validationError = responseData && Object.entries(responseData)
        .flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages])
            .map((message) => `${field.replaceAll('_', ' ')}: ${message}`),
        )[0]
      setError(
        typeof detail === 'string'
          ? detail
          : validationError ?? requestError.message ?? 'Unable to register. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='mx-auto p-6 sm:p-10 lg:container lg:p-20'>
      <div className='mx-auto flex min-h-95.5 w-full max-w-162 flex-col items-center justify-center rounded-lg border border-[#9a9caa] p-7.75'>
        {isRegistered ? (
          <div className='w-full text-center' role='status'>
            <h1 className='mb-3 text-3xl font-semibold text-[#272343]'>Account created</h1>
            <p className='mb-6 text-sm text-gray-600'>Your account has been registered. You can now sign in.</p>
            <Link to='/login' className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#007580] font-semibold text-white'>
              Continue to login <MoveRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <h1 className='mb-5 text-3xl font-semibold capitalize text-[#272343]'>Create your account</h1>
            <form onSubmit={handleSubmit} className='flex w-full flex-col space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-700'>
                  First name
                  <input
                    type='text'
                    name='first_name'
                    autoComplete='given-name'
                    required
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder='First name'
                    className='h-12.5 rounded-lg bg-[#f0f2f3] px-3.5 outline-none focus:ring-2 focus:ring-[#007580]'
                  />
                </label>
                <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-700'>
                  Last name
                  <input
                    type='text'
                    name='last_name'
                    autoComplete='family-name'
                    required
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder='Last name'
                    className='h-12.5 rounded-lg bg-[#f0f2f3] px-3.5 outline-none focus:ring-2 focus:ring-[#007580]'
                  />
                </label>
              </div>
              <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-700'>
                Username
                <input
                  type='text'
                  name='username'
                  autoComplete='username'
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder='Choose a username'
                  className='h-12.5 rounded-lg bg-[#f0f2f3] px-3.5 outline-none focus:ring-2 focus:ring-[#007580]'
                />
              </label>
              <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-700'>
                Email
                <input
                  type='email'
                  name='email'
                  autoComplete='email'
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder='you@example.com'
                  className='h-12.5 rounded-lg bg-[#f0f2f3] px-3.5 outline-none focus:ring-2 focus:ring-[#007580]'
                />
              </label>
              <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-700'>
                Password
                <input
                  type='password'
                  name='password'
                  autoComplete='new-password'
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder='Create a password'
                  className='h-12.5 rounded-lg bg-[#f0f2f3] px-3.5 outline-none focus:ring-2 focus:ring-[#007580]'
                />
              </label>

              {error && <p role='alert' className='text-sm text-red-700'>{error}</p>}

              <button
                type='submit'
                disabled={isSubmitting}
                className='flex h-12.5 w-full items-center justify-center gap-2.5 rounded-lg bg-[#007580] text-base font-semibold capitalize text-white disabled:cursor-not-allowed disabled:opacity-70'
              >
                {isSubmitting ? 'Creating account…' : 'Create account'} <MoveRight />
              </button>
            </form>

            <p className='mt-4 flex items-center justify-center gap-2.5 text-center text-base font-normal text-[#272343]'>
              Already have an account?
              <Link to='/login' className='text-[#007580]'>Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default Register

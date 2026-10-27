import { Link } from 'react-router-dom'

const Error = () => {
  return (
    <main className='flex min-h-[55vh] items-center justify-center px-4 py-12'>
      <section className='w-full max-w-xl rounded-2xl bg-[#6050DC] px-5 py-12 text-center text-white sm:px-10 sm:py-16'>
        <h1 className='text-3xl font-bold sm:text-5xl'>Page Not Found</h1>
        <p className='mb-6 mt-3 text-sm text-white/80 sm:text-base'>The page you are trying to access does not exist.</p>
        <Link to='/' className='inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-2 font-semibold text-[#6050DC]'>
          Back Home
        </Link>
      </section>
    </main>
  )
}

export default Error
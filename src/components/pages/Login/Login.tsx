'use client'
import { Button, Label, TextInput } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { LoginData } from '@/shared/types'
import { SyntheticEvent, useRef, useState } from 'react'
import AuthAPI from '@/services/auth'
import { useCurrentUserStore } from '@/store/store'
import Image from 'next/image'
import { IoIosEyeOff, IoMdEye } from 'react-icons/io'

const Login = () => {
  const formDataRef = useRef<LoginData>({} as LoginData)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setCurrentUser, setLoading } = useCurrentUserStore()

  const router = useRouter()
  const { login, getCurrentUser } = AuthAPI

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const email = formDataRef.current.email
    const password = formDataRef.current.password

    const loginBody: LoginData = {
      email,
      password,
    }

    const data = await login(loginBody)

    if (data) {
      // Fetch current user data after successful login
      setLoading(true)
      const userData = await getCurrentUser()
      if (userData) {
        setCurrentUser(userData)
      }
      setLoading(false)
      router.push('/')
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    formDataRef.current = {
      ...formDataRef.current,
      [name]: value,
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 w-full -mt-16">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/img/logo.png"
              alt="Logo"
              width={128}
              height={128}
              className="rounded-xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Sign in to your account
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="email"
                value="Email"
                className="mb-2 block text-gray-700 dark:text-gray-300"
              />
              <TextInput
                id="email"
                placeholder="name@company.com"
                required
                type="email"
                name="email"
                onChange={handleInputChange}
                autoComplete="on"
                sizing="lg"
              />
            </div>
            <div className="relative">
              <Label
                htmlFor="password"
                value="Password"
                className="mb-2 block text-gray-700 dark:text-gray-300"
              />
              <div className="relative">
                <TextInput
                  required
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  onChange={handleInputChange}
                  autoComplete="on"
                  sizing="lg"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoIosEyeOff /> : <IoMdEye />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              color="purple"
              className="w-full"
              size="lg"
              isProcessing={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © {new Date().getFullYear()} 3D Part. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login

'use client'
import { Button, Label, TextInput } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { LoginData } from '@/shared/types'
import { SyntheticEvent, useRef } from 'react'
import AuthAPI from '@/services/auth'
import { useCurrentUserStore } from '@/store/store'

const Login = () => {
  const formDataRef = useRef<LoginData>({} as LoginData)
  const { setCurrentUser, setLoading } = useCurrentUserStore()

  const router = useRouter()
  const { login, getCurrentUser } = AuthAPI

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

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
      router.push('products')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    formDataRef.current = {
      ...formDataRef.current,
      [name]: value,
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email" value="Your email" />
          </div>
          <TextInput
            id="email"
            placeholder="name@flowbite.com"
            required
            type="email"
            name="email"
            onChange={handleInputChange}
            autoComplete="on"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password" value="Your password" />
          </div>
          <TextInput
            required
            id="password"
            type="password"
            name="password"
            onChange={handleInputChange}
            autoComplete="on"
          />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}

export default Login

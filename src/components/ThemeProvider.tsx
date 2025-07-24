'use client'

import { ChakraProvider } from '@chakra-ui/react'
import ThemeProvider from '@/components/ThemeProvider'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ChakraProvider>
  )
}
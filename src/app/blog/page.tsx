import Blog from '@/components/pages/Blog/Blog'
import React, { Suspense } from 'react'

const BlogPage = () => {
  // the open post lives in the URL (?id=...), read on the client
  return (
    <Suspense>
      <Blog />
    </Suspense>
  )
}

export default BlogPage

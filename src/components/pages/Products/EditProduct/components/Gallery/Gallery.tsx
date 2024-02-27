'use client'

import React from 'react'
import UploadImages from './components/UploadImages/UploadImages'
import ImagesPresenter from './components/ImagesPresenter/ImagesPresenter'

const Gallery = () => {
  return (
    <div>
      <ImagesPresenter />
      <UploadImages />
    </div>
  )
}

export default Gallery

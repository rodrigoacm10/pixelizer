'use client'

import { PixelArtGenerate } from '@/components/PixelArtGenerate'
import { PixelizerCanvaImage } from '@/components/PixelizerCanvaImage'

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex">
      <div className="flex items-center justify-center flex-1 flex-col">
        <PixelizerCanvaImage />

        <PixelArtGenerate />
      </div>
    </div>
  )
}

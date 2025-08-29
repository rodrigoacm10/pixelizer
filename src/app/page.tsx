'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [pixelSize, setPixelSize] = useState<number>(4) // tamanho do bloco
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      const img = new window.Image()
      img.src = objectUrl
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height })
      }
    }
  }, [])

  useEffect(() => {
    if (!preview || !dimensions) return

    const img = new window.Image()
    img.src = preview
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = dimensions.width
      canvas.height = dimensions.height

      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)

      const imageData = ctx.getImageData(
        0,
        0,
        dimensions.width,
        dimensions.height,
      )
      const data = imageData.data

      for (let y = 0; y < dimensions.height; y += pixelSize) {
        for (let x = 0; x < dimensions.width; x += pixelSize) {
          let r = 0,
            g = 0,
            b = 0,
            count = 0

          for (let dy = 0; dy < pixelSize; dy++) {
            for (let dx = 0; dx < pixelSize; dx++) {
              const px = x + dx
              const py = y + dy
              if (px < dimensions.width && py < dimensions.height) {
                const index = (py * dimensions.width + px) * 4
                r += data[index]
                g += data[index + 1]
                b += data[index + 2]
                count++
              }
            }
          }

          r = Math.floor(r / count)
          g = Math.floor(g / count)
          b = Math.floor(b / count)

          for (let dy = 0; dy < pixelSize; dy++) {
            for (let dx = 0; dx < pixelSize; dx++) {
              const px = x + dx
              const py = y + dy
              if (px < dimensions.width && py < dimensions.height) {
                const index = (py * dimensions.width + px) * 4
                data[index] = r
                data[index + 1] = g
                data[index + 2] = b
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }
  }, [preview, dimensions, pixelSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  return (
    <div className="bg-red-100 min-h-screen flex">
      <div className="flex-1 items-center justify-center grid grid-cols-2 max-w-[1280px] ml-auto mr-auto bg-red-400">
        <div className="flex items-center justify-center">
          <div
            {...getRootProps()}
            className="bg-black text-white p-6 w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer"
          >
            <input {...getInputProps()} />
            {preview && dimensions ? (
              <canvas ref={canvasRef} className="max-w-[500px] max-h-[500px]" />
            ) : isDragActive ? (
              <p>Solte a imagem aqui...</p>
            ) : (
              <p>Arraste ou clique para enviar</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex-1 bg-blue-700 text-white p-4 rounded-xl">
            <p className="text-lg font-semibold">📐 Informações da Imagem</p>
            {dimensions ? (
              <>
                <p>
                  Dimensões: {dimensions.width} x {dimensions.height} px
                </p>
                <p>Total de pixels: {dimensions.width * dimensions.height}</p>
                <div>
                  <p>Quantidade (px por bloco):</p>
                  <input
                    type="number"
                    value={pixelSize}
                    onChange={(e) =>
                      +e.target.value !== 0
                        ? setPixelSize(Number(e.target.value))
                        : ''
                    }
                    className="text-black p-1 rounded"
                  />
                </div>
              </>
            ) : (
              <p>Nenhuma imagem carregada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

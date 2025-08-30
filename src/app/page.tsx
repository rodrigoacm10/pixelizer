'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [pixelSize, setPixelSize] = useState<number>(1)
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

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'pixelated-image.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="bg-white min-h-screen flex">
      <div className="flex items-center justify-center flex-1">
        <div className="w-full grid min-[950px]:grid-cols-[60fr_40fr] gap-4 max-w-[1280px] ml-auto mr-auto p-6">
          <div className="bg-white shadow-xl border-[1px] p-2 rounded-xl flex">
            <div
              {...getRootProps()}
              className={`rounded-xl bg-[#f5f5f5] flex-1 p-6 flex items-center justify-center border-2 border-dashed border-[#9da2ad] cursor-pointer text-[#9da2ad]`}
            >
              <input {...getInputProps()} />
              {preview && dimensions ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-[500px] max-h-[500px]"
                />
              ) : isDragActive ? (
                <p>Solte a imagem aqui...</p>
              ) : (
                <p>Choose a image</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex-1 bg-white border-[1px] rounded-xl shadow-lg">
              <div className="py-3 border-b">
                <p className="text-[#303030] text-center text-xs">
                  Configurations
                </p>
              </div>
              {dimensions ? (
                <div className="p-5 text-black grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] font-semibold">Dimensões</p>
                    <p>
                      {dimensions.width} x {dimensions.height} px
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold">Pixels</p>
                    <p>{dimensions.width * dimensions.height} px</p>
                  </div>

                  <div className="col-span-full">
                    <p className="text-[11px] font-semibold">Pixels rating</p>
                    <input
                      type="number"
                      value={pixelSize}
                      onChange={(e) =>
                        +e.target.value !== 0
                          ? setPixelSize(Number(e.target.value))
                          : ''
                      }
                      className="px-4 py-2 border shadow-sm border-[#ededed] rounded w-full focus:border-[#ededed] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-center p-4 text-black">Choose a image</p>
              )}
            </div>

            <div className="rounded-xl shadow-lg border-[1px] mt-4 flex flex-col items-center p-4">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Download image
              </button>
              <p className="text-black mt-2 text-sm">
                Clique para salvar sua imagem pixelada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

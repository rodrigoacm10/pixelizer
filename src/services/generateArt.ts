import axios from 'axios'

type PayloadType = {
  prompt: string
  width: number
  height: number
  num_images: number
  seed: number
  prompt_style: string
  tile_x: boolean
  tile_y: boolean
  input_image: string
  remove_bg: boolean
  strength: number
}

export const generateArt = async (payload: PayloadType) => {
  const response = await axios.post(
    process.env.NEXT_PUBLIC_API_URL as string,
    JSON.stringify(payload),
    {
      headers: {
        'X-RD-Token': process.env.NEXT_PUBLIC_API_KEY,
        'Content-Type': 'application/json',
      },
    },
  )

  return response.data
}

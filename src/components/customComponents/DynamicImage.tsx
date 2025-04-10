import { getImage } from '@/lib/plaiceholder'
import Image from 'next/image'
import React from 'react'

async function DynamicImage({url}:{url:string}) {
    const { base64, img } = await getImage(url)
  return (
      <Image
            src={img}
            alt="Attachment"
            width={500}
            height={500}
            placeholder={base64 ? 'blur' : 'empty'}
            blurDataURL={base64}
            className="mx-auto size-fit max-h-[30rem] rounded-2xl"
          />
  )
}

export default DynamicImage
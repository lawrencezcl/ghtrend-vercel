import { put } from '@vercel/blob'

export async function saveBlob(path: string, data: string | Buffer, contentType: string) {
  const buffer = typeof data === 'string' ? Buffer.from(data) : data
  const r = await put(path, buffer, {
    access: 'public',
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN
  })
  return r.url
}
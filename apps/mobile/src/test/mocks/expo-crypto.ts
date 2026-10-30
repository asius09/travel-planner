import crypto from 'node:crypto'

export const randomUUID = () => crypto.randomUUID()
export const getRandomValues = (arr: any) => crypto.getRandomValues(arr)


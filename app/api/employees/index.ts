import { NextApiRequest, NextApiResponse } from 'next'

const employees = [
  { id: '1', name: 'John Doe', position: 'Software Engineer' },
  { id: '2', name: 'Jane Smith', position: 'Product Manager' },
  { id: '3', name: 'Bob Johnson', position: 'Designer' },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(employees)
}
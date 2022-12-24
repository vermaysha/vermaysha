import axios from 'axios'
import { exit } from 'process'
import randomAgent from 'random-useragent'

const token = process.env.PERSONAL_TOKEN || null

if (!token) {
  console.log('PERSONAL_TOKEN does\'nt exists')
  exit(0)
}

const headers = {
  'Content-Type': 'application/json',
  'User-Agent': randomAgent.getRandom(),
  'Authorization': `Bearer ${token}`
}

export async function graphql(query: string) {
  const response = await axios('https://api.github.com/graphql', {
    method: 'post',
    headers,
    data: {
      query,
    }
  })

  return response
}

export async function api(url: string, params: any = null) {
  const response = await axios(`https://api.github.com/${url}`, {
    method: 'get',
    headers,
    params
  })

  return response
}

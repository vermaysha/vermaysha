import axios from 'axios'
import randomAgent from 'random-useragent'

const headers = {
  'Content-Type': 'application/json',
  'User-Agent': randomAgent.getRandom(),
  'Authorization': `Bearer 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`
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

export interface INodes {
  nameWithOwner: string
  stargazers: {
    totalCount: number
  }
  forkCount: number
  languages: {
    edges: {
      size: number
      node: {
        name: string
        color: string
      }
    }[]
  }
}

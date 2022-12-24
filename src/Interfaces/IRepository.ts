import { INodes } from "./INodes"

export interface IRepository {
  pageInfo: {
    hasNextPage: boolean
    endCursor: string
  }
  nodes: INodes[]
}

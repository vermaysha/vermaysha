import { IGithubName, IRepository, IContrib } from './Interfaces'
import { graphql, sleep } from './helpers'

export class Query {
  static async run(query: string): Promise<any> {
    const response = await graphql(query)

    if (response.status === 202) {
      console.log('A path returned 202. Retrying...')
      await sleep(5)
    }


    return response.data
  }

  static async repositories(ownedCursor?: string): Promise<IRepository> {
    const query = `{
      viewer {
        repositories(
          first: 100
          orderBy: { field: UPDATED_AT, direction: DESC }
          isFork: false
          after: ${ ownedCursor ? '"' + ownedCursor + '"' : 'null' }
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            nameWithOwner
            stargazers {
              totalCount
            }
            forkCount
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }`

    return (await this.run(query)).data.viewer.repositories
  }

  static async repositoriesContrib(contribCursor?: string):Promise<IRepository> {
    const query = `{
      viewer {
        repositoriesContributedTo(
          first: 100
          includeUserRepositories: false
          orderBy: { field: UPDATED_AT, direction: DESC }
          contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY, PULL_REQUEST_REVIEW]
          after: ${ contribCursor ? '"' + contribCursor + '"' : 'null' }
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            nameWithOwner
            stargazers {
              totalCount
            }
            forkCount
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }`

    return (await this.run(query)).data.viewer.repositoriesContributedTo
  }

  static async githubName(): Promise<IGithubName> {
    const query = `{
      viewer {
        login
        name
      }
    }`

    return (await this.run(query)).data.viewer
  }

  static async contribYear(): Promise<IContrib> {
    const query = `query {
      viewer {
        contributionsCollection {
          contributionYears
        }
      }
    }`

    return (await this.run(query)).data.viewer
  }

  static contribByYear(year: number) {
    return `year${year}: contributionsCollection(
      from: "${year}-01-01T00:00:00Z",
      to: "${year + 1}-01-01T00:00:00Z"
  ) {
    contributionCalendar {
      totalContributions
    }
  }`
  }

  static async allContribs(years: number[]) {
    let byYears: string[] = []

    for (const year of years) {
      byYears.push(this.contribByYear(year))
    }

    const query = `query {
      viewer {
        ${byYears.join('\n')}
      }
    }`

    return (await this.run(query)).data.viewer
  }
}

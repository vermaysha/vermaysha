import { Query } from './Query'
import { IContribByYear, INodes, IRepository } from './Interfaces'
import { api, isIterable } from './helpers'

interface ILineChanged {
  additions: number
  deletions: number
}

interface ILanguages {
  name: string
  size: number
  occurrences: number
  color: string
  percentage?: number
}

export class Stats {
  public name: string | null = null
  public login: string | null = null
  public repos: INodes[] = []
  public totalContrib: number = 0
  public lineChanged: ILineChanged = {
    additions: 0,
    deletions: 0
  }
  public views: number = 0
  public stars: number = 0
  public forks: number = 0
  public languages: ILanguages[] = []
  private languageTotalSize: number = 0
  private excludeRepos: string[]
  private excludeLanguages: string[]

  constructor(excludeRepos: string, excludeLanguages: string) {
    this.excludeRepos = excludeRepos.toLowerCase().split(',')
    this.excludeLanguages = excludeLanguages.toLowerCase().split(',')
  }

  public async intitialize() {
    const githubName = await Query.githubName()
    await this.setRepositories()
    await this.setRepositoriesContrib()

    for (const node of this.repos) {
      this.forks += node.forkCount || 0
      this.stars += node.stargazers.totalCount || 0

      for (const lang of node.languages.edges) {
        const index = this.languages.findIndex((val) => {
          return val.name === lang.node.name
        })

        if (!this.excludeLanguages.includes(lang.node.name.toLowerCase())) {
          if (index == -1) {
            this.languages.push({
              name: lang.node.name,
              color: lang.node.color,
              size: lang.size,
              occurrences: 1
            })
          } else {
            this.languages[index].size += lang.size
            this.languages[index].occurrences += 1
          }

          this.languageTotalSize += lang.size
        }

      }
    }

    for (const lang of this.languages) {
      lang.percentage = 100 * (lang.size / this.languageTotalSize)
    }

    this.languages.sort((a, b) => {
      return b.percentage! - a.percentage!;
    })

    this.name = githubName.name ?? 'No Name'
    this.login = githubName.login ?? 'No Name'
    this.totalContrib = await this.getTotalContrib()
    await this.setLineChanged()
    await this.setViews()
  }

  private async setRepositories(): Promise<void> {
    let cursor: string | undefined

    while (true) {
      const repo = await Query.repositories(cursor)

      repo.nodes.forEach((node: INodes) => {
        const name = node.nameWithOwner.split('/')
        if (!this.excludeRepos.includes((name[1] || name[0]).toLowerCase())) {
          this.repos.push(node)
        }
      })

      if (repo.pageInfo.hasNextPage) {
        cursor = repo.pageInfo.endCursor
      } else {
        break
      }
    }
  }

  private async setRepositoriesContrib(): Promise<void> {
    let cursor: string | undefined

    while (true) {
      const repo = await Query.repositoriesContrib(cursor)

      repo.nodes.forEach((node: INodes) => {
        const name = node.nameWithOwner.split('/')
        if (!this.excludeRepos.includes((name[1] || name[0]).toLowerCase())) {
          this.repos.push(node)
        }
      })

      if (repo.pageInfo.hasNextPage) {
        cursor = repo.pageInfo.endCursor
      } else {
        break
      }
    }
  }

  private async getTotalContrib() {
    let total: number = 0
    const years: number[]  = (await Query.contribYear()).contributionsCollection.contributionYears!

    const allContribs = await Query.allContribs(years)

    for (const key in allContribs) {
      if (Object.prototype.hasOwnProperty.call(allContribs, key)) {
        const contrib: IContribByYear = allContribs[key];
        total += contrib.contributionCalendar.totalContributions ?? 0
      }
    }

    return total
  }

  private async setLineChanged() {
    for (const repo of this.repos) {
      const res = await api(`repos/${repo.nameWithOwner}/stats/contributors`)

      if (!isIterable(res.data)) {
        continue
      }

      for (const data of res.data) {
        if (data.author.login !== this.login) {
          continue
        }

        for (const week of data.weeks) {
          this.lineChanged.additions += week.a || 0
          this.lineChanged.deletions += week.d || 0
        }
      }
    }
  }

  private async setViews() {
    for (const repo of this.repos) {
      const res = await api(`repos/${repo.nameWithOwner}/traffic/views`)

      if (!res.data.count) {
        continue
      }

      this.views += res.data.count
    }
  }
}

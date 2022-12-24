import { resolve } from "path";
import { Stats } from "./Stats"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { numberWithCommas } from "./helpers";

(async () => {
  const excludeRepository = process.env.EXCLUDE_REPO || ''
  const excludeLanguages = process.env.EXCLUDE_LANG || ''
  const stats = new Stats(excludeRepository, excludeLanguages)
  await stats.intitialize()

  const generatedPath = resolve(__dirname, '../', 'generated')

  if (!existsSync(generatedPath)) {
    mkdirSync(generatedPath, {
      recursive: true
    })
  }

  generateMostUsedLanguage(stats, generatedPath)
  generateOverview(stats, generatedPath)
})();

function generateMostUsedLanguage(stats: Stats, generatedPath: string) {
  console.log('Generating most used language images ..')
  let progress: string = ''
  let langList: string = ''
  let delayBetween: number = 150
  let i = 0

  const svg = readFileSync(resolve(__dirname, '../', 'templates', 'languages.svg'), 'utf8')
  for (const key in stats.languages) {
    if (Object.prototype.hasOwnProperty.call(stats.languages, key)) {
      const value = stats.languages[key];
      const color = value.color || '#000000'
      let ratio = [.98, .01]

      if (value.percentage && value.percentage > 50) {
        ratio = [.99, .01]
      }

      if (i === stats.languages.length - 1) {
        ratio = [1, 0]
      }

      progress += `<span style="background-color: ${color};
        width: ${(ratio[0] * value.percentage!).toFixed(3)}%;
        margin-right: ${(ratio[1] * value.percentage!).toFixed(3)}%;"
        class="progress-item"></span>
        `

      langList += `<li style="animation-delay: ${i * delayBetween}ms;">
          <svg xmlns="http://www.w3.org/2000/svg" class="octicon" style="fill:${color};"
            viewBox="0 0 16 16" version="1.1" width="16" height="16"><path
            fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>
          <span class="lang">${value.name}</span>
          <span class="percent">${value.percentage!.toFixed(2)}%</span>
        </li>
        `
      i++
    }
  }

  const out = svg.replace('{{ progress }}', progress)
    .replace('{{ lang_list }}', langList)

  writeFileSync(resolve(generatedPath, 'languages.svg'), out)
  console.log('Most used language images has been generated')
}

function generateOverview(stats: Stats, generatedPath: string) {
  console.log('Generating overview images ..')
  const svg = readFileSync(resolve(__dirname, '../', 'templates', 'overview.svg'), 'utf8')

  const totalLineChanged = stats.lineChanged.additions + stats.lineChanged.deletions

  const out = svg.replace('{{ name }}', stats.name || 'No Name')
    .replace('{{ stars }}', numberWithCommas(stats.stars.toString()))
    .replace('{{ forks }}', numberWithCommas(stats.forks.toString()))
    .replace('{{ contributions }}', numberWithCommas(stats.totalContrib.toString()))
    .replace('{{ lines_changed }}', numberWithCommas(totalLineChanged.toString()))
    .replace('{{ views }}', numberWithCommas(stats.views.toString()))
    .replace('{{ repos }}', numberWithCommas(stats.repos.length.toString()))

    writeFileSync(resolve(generatedPath, 'overview.svg'), out)
    console.log('Vverview images has been generated')
}

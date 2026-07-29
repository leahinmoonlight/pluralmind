import fs from 'fs'

// Remove the "Hidden" category from appearing at the end of the API Reference
const refIndex = fs.readFileSync('docs/api/index.md', 'utf-8')
const hiddenIdx = refIndex.indexOf('## Hidden')
fs.writeFileSync('docs/api/index.md', refIndex.slice(0, hiddenIdx - 1), 'utf-8')

// Remove it from the sidebar as well
const sidebar = JSON.parse(fs.readFileSync('docs/api/typedoc-sidebar.json', 'utf-8'))
const hiddenCategoryIdx = sidebar.findIndex((item) => item.text === 'Hidden')
sidebar.splice(hiddenCategoryIdx, 1)
fs.writeFileSync('docs/api/typedoc-sidebar.json', JSON.stringify(sidebar), 'utf-8')

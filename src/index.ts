import { readFile, writeFile, rmdir, mkdir } from 'fs'

export enum ArgsEnum {
  b = 'base',
  w = 'widget',
  e = 'edit',
  c = 'config'
}

export type CliArguments = Record<ArgsEnum, string>

export const argDefaults: CliArguments = {
  base: 'dist',
  edit: 'edit.html',
  widget: 'widget.html',
  config: 'widget-config.json'
}

export const argDescriptions: CliArguments = {
  base: 'base path where widget assets are exported',
  edit: 'file for edit view of widget',
  widget: 'for for main view of widget',
  config: 'base config for widget'
}

const baseConfig = {
  name: 'Custom Widget',
  sizes: [
    { name: '2 x 2', value: { cols: 2, rows: 2 } },
    { name: '2 x 4', value: { cols: 2, rows: 4 } },
    { name: '4 x 2', value: { cols: 4, rows: 2 } },
    { name: '4 x 4', value: { cols: 4, rows: 4 } },
    { name: '4 x 6', value: { cols: 4, rows: 6 } }
  ],
  identifier: 'third-party',
  title: 'Custom Widget',
  editMode: false,
  editSource: '',
  source: '',
  size: { name: '4 x 4', value: { cols: 4, rows: 4 } }
}

const loadFile = async (path) => new Promise<string>((resolve, reject) => {
  readFile(path, 'utf8', (err, data) => {
    if (err) {
      return reject(err)
    }
    resolve(data)
  })
})

const saveConfig = (path, data) => new Promise<string>((resolve) => {
  writeFile(path, JSON.stringify(data), (err) => {
    resolve(err ? 'Some error happened while saving' : `Saved widget to ${path}`)
  })
})

const createTarget = (path) => new Promise<void>((resolve, reject) => mkdir(path, { recursive: true }, (err) => err ? reject(err) : resolve()))

const clearTarget = (path) => new Promise<void>((resolve, reject) => rmdir(path, { recursive: true }, (err) => err ? reject(err) : resolve(path))).then(createTarget)

const packageFiles = async (files) => await Object.entries(files).reduce(async (_packaged, [key, path]) => {
  const isConfig = key === 'config'
  const packaged = await _packaged
  const fileRaw = await loadFile(path)
  const readValue = isConfig ? JSON.parse(fileRaw) : fileRaw;
  return isConfig ? { ...readValue, ...packaged } : { ...packaged, [key]: readValue }
}, baseConfig as any)

export async function packageNxWidget(cliArguments: CliArguments): Promise<{ message: string }> {
  const basePath = `${process.cwd()}/${cliArguments.base}`;

  const files = {
    editSource: `${basePath}/${cliArguments.edit}`,
    source: `${basePath}/${cliArguments.widget}`,
    config: `${basePath}/${cliArguments.config}`
  }

  const packagedConfig = await packageFiles(files)
  const widgetFileName = `${packagedConfig.name.split(' ').map(segment => segment.toLowerCase()).join('-')}.wgt`
  const widgetTargetPath = `${basePath}/${widgetFileName}`
  await clearTarget(basePath)
  const message = await saveConfig(widgetTargetPath, packagedConfig)

  return { message }
}

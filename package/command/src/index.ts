#!/usr/bin/env node

import process from 'node:process'
import { mkdir, readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { copySync, symlink, unlink } from 'fs-extra'
import chalk from 'chalk'
import pkg from '../package.json'
import { exec, log } from './tool'

const program = new Command()
const cwd = process.cwd()
const appRootName = '.app'
const appRootPath = resolve(cwd, appRootName)

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

program
  .command('create')
  .arguments('projectName')
  .description('Create a web project')
  .action(async (projectName: string) => {
    const targetPath = resolve(cwd, projectName)
    await mkdir(targetPath)
    try {
      const templatePath = resolve(__dirname, 'template')
      copySync(templatePath, targetPath)
      await exec({ cli: 'ni', cwd: targetPath })
      log(`
  ${chalk.green.bold(`${projectName} Successfully Created!`)}

  ${chalk.cyan('Navigate to the Project:')}
  ${chalk.yellow.bold(`cd ${projectName}`)}

  ${chalk.blue('Run the Project:')}
  ${chalk.green('npm start')}
  
  ${(chalk.magenta('Build the Project:'))}
  ${(chalk.green('npm run test'))}
`)
    }
    catch (err) {
      console.error(err)
    }
  })

program
  .command('install')
  .description('Install dependencies')
  .action(async () => {
    await exec({ cli: 'ni', cwd: appRootPath })
    const linkSourcePath = resolve(appRootPath, 'node_modules')
    const linkTargetPath = resolve(cwd, 'src', 'node_modules')

    try {
      const targetStat = await stat(linkTargetPath)
      targetStat.isDirectory() && await unlink(linkTargetPath)
    }
    catch (error) {
    }

    await symlink(linkSourcePath, linkTargetPath)
    log(chalk.blue(`Symbolic link created ${linkSourcePath} -> ${linkTargetPath}`))
  })

program
  .command('start')
  .description('run project')
  .action(async () => {
    await exec({ cli: 'npm run dev', cwd: appRootPath })
  })

program
  .command('build')
  .description('Build project')
  .action(async () => {
    await exec({ cli: 'npm run build', cwd: appRootPath })
  })

program
  .command('preview')
  .description('Preview project')
  .action(async () => {
    await exec({ cli: 'npm run build && npm run preview', cwd: appRootPath })
  })

async function verifyApp() {
  try {
    const pkgPath = resolve(cwd, 'package.json')

    const pkgStat = await stat(pkgPath)
    if (!pkgStat.isFile())
      return

    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
    if (!pkg.scripts)
      return

    if (!Object.values(pkg.scripts as Record<string, string>).some(scripts => scripts.split(' ').includes('crw')))
      return

    try {
      const targetPathStat = await stat(appRootPath)
      if (!targetPathStat.isDirectory())
        throw new Error(`${appRootPath} must to be a directory`)
    }
    catch (error) {
      await mkdir(appRootPath)
      const templatePath = resolve(__dirname, 'template', appRootName)
      copySync(templatePath, appRootPath)
      await exec({ cli: 'npm run install', cwd })
    }
  }
  catch (error) {
    throw new Error((error as Error).message)
  }
}

program.hook('preAction', async () => {
  await verifyApp()
})

program.parse()

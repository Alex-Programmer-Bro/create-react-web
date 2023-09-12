#!/usr/bin/env node

import process from 'node:process'
import { mkdir, readFile, rmdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { copySync, symlink, unlink } from 'fs-extra'
import pkg from '../package.json'
import { exec } from './exec'

const program = new Command()
const cwd = process.cwd()

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
      await exec({ cli: 'npm run install', cwd: targetPath })
    }
    catch (err) {
      console.error(err)
    }
  })

program
  .command('install')
  .description('Install dependencies')
  .action(async () => {
    const targetpath = resolve(cwd, '.react-web')
    await exec({ cli: 'ni', cwd: targetpath })
    const linkSourcePath = resolve(targetpath, 'node_modules')
    const linkTargetPath = resolve(cwd, 'src', 'node_modules')

    try {
      const targetStat = await stat(linkTargetPath)
      targetStat.isDirectory() && await unlink(linkTargetPath)
    }
    catch (error) {

    }

    await symlink(linkSourcePath, linkTargetPath)
  })

program
  .command('start')
  .description('run project')
  .action(async () => {
    const targetpath = resolve(cwd, '.react-web')
    await exec({ cli: 'npm run dev', cwd: targetpath })
  })

program
  .command('build')
  .description('Build project')
  .action(async () => {
    const targetpath = resolve(cwd, '.react-web')
    await exec({ cli: 'npm run build', cwd: targetpath })
  })

program
  .command('preview')
  .description('Preview project')
  .action(async () => {
    const targetpath = resolve(cwd, '.react-web')
    await exec({ cli: 'npm run build && npm run preview', cwd: targetpath })
  })

async function checkDevStack() {
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

    const targetPath = resolve(cwd, '.react-web')

    try {
      const targetPathStat = await stat(targetPath)
      if (!targetPathStat.isDirectory())
        throw new Error(`${targetPath} must to be a directory`)
    }
    catch (error) {
      await mkdir(targetPath)
      const templatePath = resolve(__dirname, 'template', '.react-web')
      copySync(templatePath, targetPath)
      await unlink(resolve(cwd, 'node_modules'))
      await exec({ cli: 'npm run install', cwd })
    }
  }
  catch (error) {
  }
}

program.hook('preAction', async () => {
  await checkDevStack()
})

program.parse()

#!/usr/bin/env node

import process from 'node:process'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { copySync, symlink } from 'fs-extra'
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
  .description('create a web project')
  .action(async (projectName: string) => {
    const targetPath = resolve(cwd, projectName)
    await mkdir(targetPath)
    try {
      const templatePath = resolve(__dirname, 'template')
      copySync(templatePath, targetPath)
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
    const linkTargetPath = resolve(cwd, 'node_modules')
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
  .description('build project')
  .action(async () => {
    const targetpath = resolve(cwd, '.react-web')
    await exec({ cli: 'npm run build', cwd: targetpath })
  })

program.parse()

#!/usr/bin/env node

import process from 'node:process'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { copySync } from 'fs-extra'
import pkg from '../package.json'

const program = new Command()

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

program
  .command('create')
  .arguments('projectName')
  .description('create a web project')
  .action(async (projectName: string) => {
    const targetPath = resolve(process.cwd(), projectName)
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
  .command('start')
  .description('run project')
  .action(() => { })

program.parse()

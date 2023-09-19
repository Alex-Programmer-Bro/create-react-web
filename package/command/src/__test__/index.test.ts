import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { rm } from 'node:fs/promises'
import { beforeEach, describe, it } from 'vitest'
import { exec } from '../tool'

const template = resolve(homedir(), '.create-react-web-temp')
const timeout = 1000 * 60 * 3

beforeEach(async () => {
  try {
    await rm(template, { recursive: true, force: true })
  }
  catch (error) {

  }
  await exec({ cli: 'npm uninstall create-react-web -g && npm link' })
})

describe('create react web', () => {
  it('Successfully Create', async () => {
    await exec({ cli: `crw create ${template} && cd ${template} && crw build` })
  }, timeout)

  it('After removing the .app directory, you can still run the build command', async () => {
    await exec({ cli: `crw create ${template} && cd ${template} && rimraf ./.app && crw build` })
  }, timeout)
})

import { spawn } from 'node:child_process'
import process from 'node:process'

export function exec({ cli, params = [], cwd = process.cwd() }: { cli: string; params?: string[]; cwd?: string }) {
  return new Promise((resolve, reject) => {
    const cp = spawn(cli, params, { stdio: 'inherit', shell: true, cwd })
    cp.on('close', (code) => {
      if (code === 0)
        resolve(true)
      else
        reject(code)
    })
  })
}

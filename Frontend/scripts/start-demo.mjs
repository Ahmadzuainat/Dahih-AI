import { spawn } from 'node:child_process'
import { createDemoServer } from '../server/demo-server.mjs'
const server = createDemoServer()
server.on('error', error => { console.error(error.message); process.exit(1) })
server.listen(3001, '127.0.0.1', () => {
  console.log('Demo API: http://127.0.0.1:3001')
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], { stdio: 'inherit' })
  const stop = () => { vite.kill(); server.close(); process.exit() }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  vite.on('exit', code => { server.close(); process.exit(code || 0) })
})

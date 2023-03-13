import esbuild from 'esbuild'
import exec from 'shelljs.exec'
import fs from 'fs'
import path from 'path'

// @ts-ignore
console.log(exec('giit', { async: false }).stdout)
// @ts-ignore
const versionHash = exec('git log -n 1 --pretty=format:"%h"', { async: false }).stdout
// @ts-ignore
const type = exec('git tag --points-at HEAD', { async: false }).stdout
const buildDate = new Date().toTimeString()

const banner = `
 ==========================================================================
             ____               _           __  ________ 
            / __ \\_________    (_)__  _____/ /_/ ____/ / 
           / /_/ / ___/ __ \\  / / _ \\/ ___/ __/ __/ / /  
          / ____/ /  / /_/ / / /  __/ /__/ /_/ /___/ /___
         /_/   /_/   \\____/_/ /\\___/\\___/\\__/_____/_____/
                         /___/                            

 A high performance el-api implementation
 Version ${versionHash}
 Build on ${buildDate}
 
 THIS PROGRAM IS FREE AND OPENSOURCE UNDER THE Anti-996 LICENSE (996.icu)
 Copyright (c) 2023-present, Qumolama.d
 ==========================================================================
`

console.log(banner)

if(type.indexOf('stable') === -1) {
    console.warn("[⚠]: None stable version detected! This version is not production ready yet! Use it as your own risk!\n")
}

console.log("[i] Creating bundle...")

await esbuild.build({
    
    entryPoints: (() => {
        // const scanFolder = (folder, accu) => {
        //     const files = fs.readdirSync(folder).map(f => path.resolve(folder, f))

        //     files.filter(f => fs.lstatSync(f).isFile()).forEach(f => accu.push(f))
        //     files.filter(f => fs.lstatSync(f).isDirectory()).forEach(f => scanFolder(f, accu))
        // }

        // const files = []
        // scanFolder('./src', files)
        // return files.filter(f => f.endsWith('.ts'))

        return fs.readdirSync('./src').map(f => path.resolve('./src', f)).filter(f => fs.lstatSync(f).isFile()).filter(f => f.endsWith('.ts'))
    })(),
    
    outdir: './dist/',
    bundle: true,
    platform: 'node',
    target: 'es2021',
    banner: {
        js: `/*\n${banner}\n*/;const PROGRAM_ENV_INFO = { production: ${type.indexOf('stable') ? 'true' : 'false'}, gitVersion: '' };`
    },
    tsconfig: 'tsconfig.json',
    sourcemap: false,//'external',
    minify: true,
    external: ['aws-sdk', 'nock', 'mock-aws-s3']
})

console.log("[i] Build successful!")
import { existsSync, readFileSync } from 'fs'
import Tiny, { parseOptions, Enviroment } from '../../index'
import Repl from './repl'
import prompt from 'prompt-sync'

const args = process.argv.slice(2)

const env = new Enviroment()

const option = existsSync('./tiny.config.json') ? parseOptions(readFileSync('./tiny.config.json').toString()) : parseOptions()

if (args.length <= 0) new Repl(env, option).start()
else {
    try {
        const file = readFileSync(args[0], 'utf8')

        new Tiny(file, { enviroment: env, ...option })
            .setStdin((x) =>
                prompt({
                    sigint: true,
                })(x)
            )
            .setFileName(args[0])
            .eval()
    } catch (e) {
        console.error(`Cannot open file '${args[0]}': ${e}`)
    }
}

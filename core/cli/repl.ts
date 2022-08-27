import prompt from 'prompt-sync'
import colors from 'colors'

import * as Sesan from '../../index'

type Mode = 'repl' | 'parser' | 'lexer' | 'env'

const defaultFilename: string = '<REPL>'

export default class {
    public promptSync = prompt({ sigint: true })
    public mode: Mode = 'repl'

    constructor(public env: Sesan.Enviroment, public option: Sesan.Options) {
        colors.enabled = true
    }

    public executeCommand(
        input: string,
        lexer: Sesan.Lexer,
        parsed: Sesan.Program,
        env: Sesan.Enviroment
    ): Sesan.LangObject | Sesan.Program | Array<Sesan.Token> | Sesan.Enviroment | string {
        const [command, ...args] = input.split(' ')
        const commands: Map<string, (...args: Array<string>) => Sesan.LangObject | string> = new Map([
            [
                '//mode',
                (...args) => {
                    if (!['repl', 'parser', 'lexer', 'env'].includes(args[0]) || args.length <= 0)
                        return 'Invalid mode. valid modes are `repl`, `parser`, `lexer`, and `env`'

                    this.mode = args[0] as Mode

                    return `Switched to '${this.mode}' mode`
                },
            ],
            ['//exit', () => process.exit(0)],
        ])

        if (commands.has(command)) return commands.get(command)!(...args)
        else {
            const result = new Sesan.Evaluator(parsed, env, {
                ...this.option,
                stdio: {
                    stdin: this.promptSync,
                    stdout: Sesan.stdout,
                    stderr: Sesan.stderr,
                },
                filename: defaultFilename,
                root: './',
            }).eval()

            switch (this.mode) {
                case 'repl':
                    return Sesan.objectStringify(result).gray

                case 'parser':
                    return JSON.stringify(parsed, null, 2)

                case 'lexer':
                    const tokens: Array<Sesan.Token> = []

                    let peekToken: Sesan.Token

                    while ((peekToken = lexer.nextToken()).type !== Sesan.TokenType.EOF) tokens.push(peekToken)

                    return tokens

                case 'env':
                    return env
            }
        }
    }

    public start() {
        if (this.option.useStdLibAutomatically)
            new Sesan.Evaluator(
                new Sesan.Parser(
                    new Sesan.Lexer(
                        `import('@std/lib');`,
                        {
                            ...this.option,
                            stderr: Sesan.stderr,
                        },
                        defaultFilename
                    ),
                    this.option
                ).parseProgram(),
                this.env,
                {
                    ...this.option,
                    stdio: {
                        stdin: this.promptSync,
                        stdout: Sesan.stdout,
                        stderr: Sesan.stderr,
                    },
                    filename: defaultFilename,
                    root: './',
                }
            ).eval()

        while (true) {
            const input = this.promptSync(`${`[${this.mode.toUpperCase()}]`.white.bgBlack} ${`${this.env.store.size} Env(s)`.gray} ${'➜'.red} `)

            const parser = new Sesan.Parser(
                new Sesan.Lexer(
                    input,
                    {
                        ...this.option,
                        stderr: Sesan.stderr,
                    },
                    defaultFilename
                ),
                this.option
            )

            const executed = this.executeCommand(
                input,
                new Sesan.Lexer(
                    input,
                    {
                        ...this.option,
                        stderr: Sesan.stderr,
                    },
                    defaultFilename
                ),
                parser.parseProgram(),
                this.env
            )

            if (executed && parser.errors.length > 0)
                parser.errors.forEach((error) => Sesan.printError(error, defaultFilename, Sesan.stderr, this.option))

            console.log(executed, '\n')
        }
    }
}

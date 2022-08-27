import { builtinsEval, Func, Evaluator, NULL, printError, Enviroment, objectStringify, Options, Lexer, Parser, Program, LangObject } from './core'

export * from './core'

type Stdio = (...x: Array<any>) => any

interface SesanOption extends Options {
    enviroment?: Enviroment
    root?: string
    filename?: string
}

interface StdioOptions {
    stdin: Stdio
    stdout: Stdio
    stderr: Stdio
}

const stdin: Stdio = (...x) => NULL
const stdout: Stdio = (...x) => (process ? process.stdout.write(x.join(' ')) : console.log(x.join(' ')))
const stderr: Stdio = (...x) => (process ? process.stderr.write(`${x.join(' ')}\n`) : console.error(x.join(' ')))

const defaultFilename: string = '<Sesan>'

export default class Sesan {
    public option: SesanOption
    public builtins: Map<string, Func> = new Map()
    public stdio: StdioOptions = { stdin, stdout, stderr }

    constructor(public x: string, option?: SesanOption) {
        this.option = { ...option }
    }

    public tokenizer(): Lexer {
        return new Lexer(
            this.x,
            {
                ...this.option,
                stderr: this.stdio.stderr,
            },
            this.option.filename ?? defaultFilename
        )
    }

    public parser(): Parser {
        return new Parser(this.tokenizer(), this.option)
    }

    public parseProgram(): Program {
        const program = this.parser().parseProgram()

        program.errors.forEach((error) =>
            printError(error, this.option.filename ?? defaultFilename, this.stdio.stderr, {
                ...this.option,
            })
        )

        return program
    }

    public includeStdlib(env: Enviroment) {
        if (this.option.useStdLibAutomatically)
            new Evaluator(
                new Parser(
                    new Lexer(
                        `import('@std/lib');`,
                        {
                            ...this.option,
                            stderr: this.stdio.stderr,
                        },
                        this.option.filename ?? defaultFilename
                    ),
                    this.option
                ).parseProgram(),
                env,
                {
                    ...this.option,
                    stdio: this.stdio,
                    filename: this.option.filename ?? defaultFilename,
                    root: this.option.root ?? './',
                }
            ).eval()
    }

    public evaluate(program: Program, env: Enviroment): LangObject {
        const result = new Evaluator(program, env, {
            ...this.option,
            stdio: this.stdio,
            filename: this.option.filename ?? defaultFilename,
            root: this.option.root ?? './',
        }).eval()

        return result
    }

    public eval(): string {
        const env = this.option.enviroment ?? new Enviroment()

        this.includeStdlib(env)

        return objectStringify(this.evaluate(this.parseProgram(), env))
    }

    public evalProgram(program: Program): string {
        const env = this.option.enviroment ?? new Enviroment()

        this.includeStdlib(env)

        return objectStringify(this.evaluate(program, env))
    }

    public setBuiltin(name: string, func: Func): Sesan {
        this.builtins.set(name, func)

        return this
    }

    public setBuiltins(builtins: Map<string, Func>): Sesan {
        builtins.forEach((func, name) => this.setBuiltin(name, func))

        return this
    }

    public applyBuiltins(): Sesan {
        this.builtins.forEach((func, name) => builtinsEval.set(name, func))

        return this
    }

    public setStdin(func: Stdio): Sesan {
        this.stdio = { ...this.stdio, stdin: func }

        return this
    }

    public setStdout(func: Stdio): Sesan {
        this.stdio = { ...this.stdio, stdout: func }

        return this
    }

    public setStderr(func: Stdio): Sesan {
        this.stdio = { ...this.stdio, stderr: func }

        return this
    }

    public setFileName(filename: string): Sesan {
        this.option.filename = filename

        return this
    }
}

export { SesanOption, Stdio, StdioOptions, stdin, stdout, stderr }

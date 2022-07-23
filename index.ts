import {
    builtinsEval,
    Func,
    Evaluator,
    NULL,
    printError,
    Enviroment,
    ObjectKind,
    objectStringify,
    Options,
    Lexer,
    Parser,
} from './tiny';

export * from './tiny';

type Stdio = (...x: Array<any>) => any;

type TinyOption = Options & {
    enviroment?: Enviroment;
    root?: string;
    filename?: string;
};

interface StdioOptions {
    stdin: Stdio;
    stdout: Stdio;
    stderr: Stdio;
}

const stdin: Stdio = (...x) => NULL;
const stdout: Stdio = (...x) => process.stdout.write(x.join(' '));
const stderr: Stdio = (...x) => process.stderr.write(`${x.join(' ')}\n`);

const defaultFilename: string = '<Tiny>';

export default class Tiny {
    public option: TinyOption;
    public builtins: Map<string, Func> = new Map();
    public stdio: StdioOptions = { stdin, stdout, stderr };

    constructor(public x: string, option?: TinyOption) {
        this.option = { ...option };
    }

    public tokenizer(): Lexer {
        return new Lexer(
            this.x,
            {
                ...this.option,
                stderr: this.stdio.stderr,
            },
            this.option.filename ?? defaultFilename
        );
    }

    public eval(): string {
        const env = this.option.enviroment ?? new Enviroment();

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
                this.option,
                this.stdio,
                this.option.filename ?? defaultFilename,
                this.option.root
            ).eval();

        const program = new Parser(
            this.tokenizer(),
            this.option
        ).parseProgram();

        program.errors.forEach((error) =>
            printError(
                error,
                this.option.filename ?? defaultFilename,
                this.stdio.stderr,
                {
                    ...this.option,
                }
            )
        );

        const result = new Evaluator(
            program,
            env,
            this.option,
            this.stdio,
            this.option.filename ?? defaultFilename,
            this.option.root
        ).eval();

        if (result?.kind === ObjectKind.ERROR)
            printError(
                result,
                this.option.filename ?? defaultFilename,
                this.stdio.stderr,
                this.option
            );

        return objectStringify(result);
    }

    public setBuiltin(name: string, func: Func): Tiny {
        this.builtins.set(name, func);

        return this;
    }

    public setBuiltins(builtins: Map<string, Func>): Tiny {
        builtins.forEach((func, name) => this.setBuiltin(name, func));

        return this;
    }

    public applyBuiltins(): Tiny {
        this.builtins.forEach((func, name) => builtinsEval.set(name, func));

        return this;
    }

    public setStdin(func: Stdio): Tiny {
        this.stdio = { ...this.stdio, stdin: func };

        return this;
    }

    public setStdout(func: Stdio): Tiny {
        this.stdio = { ...this.stdio, stdout: func };

        return this;
    }

    public setStderr(func: Stdio): Tiny {
        this.stdio = { ...this.stdio, stderr: func };

        return this;
    }

    public setFileName(filename: string): Tiny {
        this.option.filename = filename;

        return this;
    }
}

export { TinyOption, Stdio, StdioOptions, stdin, stdout, stderr };

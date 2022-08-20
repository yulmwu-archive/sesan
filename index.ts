import * as TinyLang from './tiny';

export * from './tiny';

type Stdio = (...x: Array<any>) => any;

interface TinyOption extends TinyLang.Options {
    enviroment?: TinyLang.Enviroment;
    root?: string;
    filename?: string;
}

interface StdioOptions {
    stdin: Stdio;
    stdout: Stdio;
    stderr: Stdio;
}

const stdin: Stdio = (...x) => TinyLang.NULL;
const stdout: Stdio = (...x) => process.stdout.write(x.join(' '));
const stderr: Stdio = (...x) => process.stderr.write(`${x.join(' ')}\n`);

const defaultFilename: string = '<Tiny>';

export default class Tiny {
    public option: TinyOption;
    public builtins: Map<string, TinyLang.Func> = new Map();
    public stdio: StdioOptions = { stdin, stdout, stderr };

    constructor(public x: string, option?: TinyOption) {
        this.option = { ...option };
    }

    public tokenizer(): TinyLang.Lexer {
        return new TinyLang.Lexer(
            this.x,
            {
                ...this.option,
                stderr: this.stdio.stderr,
            },
            this.option.filename ?? defaultFilename
        );
    }

    public parser(): TinyLang.Parser {
        return new TinyLang.Parser(this.tokenizer(), this.option);
    }

    public parseProgram(): TinyLang.Program {
        const program = this.parser().parseProgram();

        program.errors.forEach((error) =>
            TinyLang.printError(
                error,
                this.option.filename ?? defaultFilename,
                this.stdio.stderr,
                {
                    ...this.option,
                }
            )
        );

        return program;
    }

    public includeStdlib(env: TinyLang.Enviroment) {
        if (this.option.useStdLibAutomatically)
            new TinyLang.Evaluator(
                new TinyLang.Parser(
                    new TinyLang.Lexer(
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
    }

    public evaluate(
        program: TinyLang.Program,
        env: TinyLang.Enviroment
    ): TinyLang.LangObject {
        const result = new TinyLang.Evaluator(
            program,
            env,
            this.option,
            this.stdio,
            this.option.filename ?? defaultFilename,
            this.option.root
        ).eval();

        if (result?.kind === TinyLang.ObjectKind.ERROR)
            TinyLang.printError(
                result,
                this.option.filename ?? defaultFilename,
                this.stdio.stderr,
                this.option
            );

        return result;
    }

    public eval(): string {
        const env = this.option.enviroment ?? new TinyLang.Enviroment();

        this.includeStdlib(env);

        return TinyLang.objectStringify(
            this.evaluate(this.parseProgram(), env)
        );
    }

    public evalProgram(program: TinyLang.Program): string {
        const env = this.option.enviroment ?? new TinyLang.Enviroment();

        this.includeStdlib(env);

        return TinyLang.objectStringify(this.evaluate(program, env));
    }

    public setBuiltin(name: string, func: TinyLang.Func): Tiny {
        this.builtins.set(name, func);

        return this;
    }

    public setBuiltins(builtins: Map<string, TinyLang.Func>): Tiny {
        builtins.forEach((func, name) => this.setBuiltin(name, func));

        return this;
    }

    public applyBuiltins(): Tiny {
        this.builtins.forEach((func, name) =>
            TinyLang.builtinsEval.set(name, func)
        );

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

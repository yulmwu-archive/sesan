import { builtinsEval, Func } from './tiny/builtin';
import { Evaluator, printError } from './tiny/evaluator';
import { Enviroment, ObjectKind, objectStringify } from './tiny/object';
import { Options } from './tiny/options';
import { Parser } from './tiny/parser';
import { Lexer } from './tiny/tokenizer';
import prompt from 'prompt-sync';

export * from './tiny/object';
export * from './tiny/options';
export * from './tiny/tokenizer';
export * from './tiny/parser';
export * from './tiny/evaluator';

type Stdio = (...x: Array<any>) => any;

type TinyOption = Options & {
    enviroment?: Enviroment;
    root?: string;
};

interface StdioOptions {
    stdin: Stdio;
    stdout: Stdio;
    stderr: Stdio;
}

const stdin: Stdio = (...x) => prompt({ sigint: true });
const stdout: Stdio = (...x) => process.stdout.write(x.join(' '));
const stderr: Stdio = (...x) => process.stderr.write(x.join(' '));

export default class Tiny {
    public option: TinyOption;
    public builtins: Map<string, Func> = new Map();
    public stdio: StdioOptions = { stdin, stdout, stderr };

    constructor(public x: string, option?: TinyOption) {
        this.option = { ...option };
    }

    public tokenizer(): Lexer {
        return new Lexer(this.x, {
            ...this.option,
            stderr: this.stdio.stderr,
        });
    }

    public eval(): string {
        const env = this.option.enviroment ?? new Enviroment();

        if (this.option.useStdLibAutomatically)
            new Evaluator(
                new Parser(
                    new Lexer(`import('@std/lib');`, {
                        ...this.option,
                        stderr: this.stdio.stderr,
                    })
                ).parseProgram(),
                env,
                this.option,
                this.stdio,
                this.option.root
            ).eval();

        const result = new Evaluator(
            new Parser(this.tokenizer()).parseProgram(),
            env,
            this.option,
            this.stdio,
            this.option.root
        ).eval();

        if (result?.kind === ObjectKind.ERROR)
            printError(result.message, this.stdio.stderr, this.option);

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
}

export { TinyOption, Stdio, StdioOptions, stdin, stdout, stderr };

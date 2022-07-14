import { builtinsEval, Func } from './builtin';
import { Evaluator, printError } from './evaluator';
import { Enviroment, ObjectKind, objectStringify } from './object';
import { Options } from './options';
import { Parser } from './parser';
import { Lexer } from './tokenizer';
import prompt from 'prompt-sync';

export * from './object';
export * from './options';
export * from './tokenizer';
export * from './parser';
export * from './evaluator';

type Stdio = (...x: Array<any>) => any;

type TinyOption = Options & {
    enviroment?: Enviroment;
    root?: string;
};

interface StdioOptions {
    stdin: Stdio;
    stdout: Stdio;
}

const stdin: Stdio = (...x) => prompt({ sigint: true });
const stdout: Stdio = (...x) => process.stdout.write(x.join(' '));

export default class Tiny {
    public option: TinyOption;
    public builtins: Map<string, Func> = new Map();
    public stdio: StdioOptions = { stdin, stdout };

    constructor(public x: string, option?: TinyOption) {
        this.option = { ...option };
    }

    public tokenizer(): Lexer {
        return new Lexer(this.x, this.stdio.stdout);
    }

    public eval(): string {
        const env = this.option.enviroment ?? new Enviroment();

        if (this.option.useStdLibAutomatically)
            new Evaluator(
                new Parser(
                    new Lexer(`import('@std/lib');`, this.stdio.stdin)
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
            printError(result.message, this.stdio.stdout);

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
}

export { TinyOption, Stdio, StdioOptions, stdin, stdout };

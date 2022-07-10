import { builtinsEval, Func } from './builtin';
import { Evaluator, printError } from './evaluator';
import { Enviroment, ObjectKind, objectStringify } from './object';
import { Options } from './options';
import { Parser } from './parser';
import { Lexer } from './tokenizer';

export * from './object';
export * from './options';
export * from './tokenizer';
export * from './parser';
export * from './evaluator';

type TinyOption = Options & {
    enviroment?: Enviroment;
};

export default class Tiny {
    public option: TinyOption;
    public builtins: Map<string, Func> = new Map();

    constructor(public x: string, option?: TinyOption) {
        this.option = { ...option };
    }

    public tokenizer(): Lexer {
        return new Lexer(this.x);
    }

    public eval(): string {
        const env = this.option.enviroment ?? new Enviroment();
        const parser = new Parser(this.tokenizer());

        if (this.option.useStdLibAutomatically)
            new Evaluator(
                new Parser(new Lexer(`import('@std/lib');`)).parseProgram(),
                env,
                this.option
            ).eval();

        const result = new Evaluator(
            parser.parseProgram(),
            env,
            this.option
        ).eval();

        if (parser.errors.length > 0)
            parser.errors.forEach((error) => printError(error));

        if (result?.kind === ObjectKind.ERROR) printError(result.message);

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
}

export { TinyOption };

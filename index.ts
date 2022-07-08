import { evaluator } from './evaluator';
import { Enviroment, objectStringify } from './object';
import { Options } from './options';
import { Parser, Program } from './parser';
import { Lexer } from './tokenizer';

type TinyOption = Options & {
    enviroment?: Enviroment;
};

export default class {
    public option: TinyOption;

    constructor(public x: string, option?: TinyOption) {
        this.option = { ...option };
    }

    public tokenizer(): Lexer {
        return new Lexer(this.x);
    }

    public parse(): Program {
        return new Parser(this.tokenizer()).parseProgram();
    }

    public eval(): string {
        const env = this.option.enviroment ?? new Enviroment();

        if (this.option.useStdLibAutomatically)
            evaluator(
                new Parser(new Lexer(`import('@std/lib');`)).parseProgram(),
                env,
                this.option
            );

        return objectStringify(evaluator(this.parse(), env, this.option));
    }
}

export { TinyOption };

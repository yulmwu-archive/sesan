import { Evaluator, printError } from './evaluator';
import { Enviroment, ObjectKind, objectStringify } from './object';
import { Options } from './options';
import { Parser } from './parser';
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
}

export { TinyOption };

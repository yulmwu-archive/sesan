import prompt from 'prompt-sync';
import colors from 'colors';

import { evaluator, printError } from './evaluator';
import { Enviroment, LangObject, langObjectUtil, ObjectKind } from './object';
import { Parser, Program } from './parser';
import { Lexer, Token, TokenType } from './tokenizer';

type Mode = 'repl' | 'parser' | 'parser_Json' | 'lexer' | 'env';

export default class {
    public promptSync = prompt({ sigint: true });
    public mode: Mode = 'repl';

    constructor(public env: Enviroment) {
        colors.enabled = true;
    }

    public executeCommand(
        input: string,
        lexer: Lexer,
        parsed: Program,
        env: Enviroment
    ): LangObject | Program | Array<Token> | Enviroment | string {
        const [command, ...args] = input.split(' ');
        const commands: Map<
            string,
            (...args: Array<string>) => LangObject | string
        > = new Map([
            [
                '#mode',
                (...args) => {
                    if (
                        !['repl', 'parser', 'lexer', 'env'].includes(args[0]) ||
                        args.length <= 0
                    )
                        return 'Invalid mode. valid modes are `repl`, `parser`, `parser json`, `lexer`, and `env`';
                    if (
                        args[0] === 'parser' &&
                        (args.length >= 2 && args[1].toLowerCase()) === 'json'
                    )
                        this.mode = 'parser_Json';
                    else this.mode = args[0] as Mode;

                    return `Switched to '${this.mode}' mode`;
                },
            ],
            [
                '#import',
                () => {
                    evaluator(
                        new Parser(
                            new Lexer(`
                import('@std/io');
                import('@std/array');
                import('@std/util');
                `)
                        ).parseProgram(),
                        env
                    );

                    return 'Imported std';
                },
            ],
            ['#exit', () => process.exit(0)],
        ]);

        if (commands.has(command)) return commands.get(command)!(...args);

        const result = evaluator(parsed, env);

        if (result?.kind === ObjectKind.ERROR) {
            printError(result.message);
            return '';
        }

        switch (this.mode) {
            case 'repl':
                return langObjectUtil(result).gray;

            case 'parser':
                return parsed;

            case 'parser_Json':
                return JSON.stringify(parsed, null, 2);

            case 'lexer':
                const tokens: Array<Token> = [];

                let peekToken: Token;

                while ((peekToken = lexer.nextToken()).type !== TokenType.EOF)
                    tokens.push(peekToken);

                return tokens;

            case 'env':
                return env;
        }
    }

    public start() {
        while (true) {
            const input = this.promptSync(
                `${`[${this.mode.toUpperCase()}]`.white.bgBlack} ${
                    `${this.env.store.size} Env(s)`.gray
                } ${'➜'.red} `
            );

            const parser = new Parser(new Lexer(input));

            const executed = this.executeCommand(
                input,
                new Lexer(input),
                parser.parseProgram(),
                this.env
            );

            if (executed)
                if (parser.errors.length > 0)
                    parser.errors.forEach((error) => printError(error));

            console.log(executed, '\n');
        }
    }
}

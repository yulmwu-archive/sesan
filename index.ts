import prompt from 'prompt-sync';
import colors from 'colors';

import { evaluator, NULL, printError } from './evaluator';
import { Enviroment, LangObject, langObjectUtil, ObjectKind } from './object';
import { Parser, Program } from './parser';
import { Lexer, Token, TokenType } from './tokenizer';

colors.enabled = true;

const promptSync = prompt({ sigint: true });

const env = new Enviroment();

type Mode = 'repl' | 'parser' | 'parser_Json' | 'lexer' | 'env';

let mode: Mode = 'repl';

const executeCommand = (
    input: string,
    lexer: Lexer,
    parsed: Program,
    env: Enviroment
): LangObject | Program | Array<Token> | Enviroment | string => {
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
                    mode = 'parser_Json';
                else mode = args[0] as Mode;

                return `Switched to '${mode}' mode`;
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

    switch (mode) {
        case 'repl':
            return langObjectUtil(result).gray;

        case 'parser':
            return parsed;

        case 'parser_Json':
            return JSON.stringify(parsed, null, 2);

        case 'lexer':
            const tokens: Array<Token> = [];

            let peekToken: Token = { type: TokenType.EOF, literal: 'EOF' };

            while ((peekToken = lexer.nextToken()).type !== TokenType.EOF)
                tokens.push(peekToken);

            return tokens;

        case 'env':
            return env;
    }
};

while (true) {
    const input = promptSync(
        `${`[${mode.toUpperCase()}]`.white.bgBlack} ${
            `${env.store.size} Env(s)`.gray
        } ${'➜'.red} `
    );

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);

    const executed = executeCommand(input, lexer, parser.parseProgram(), env);

    if (executed)
        if (parser.errors.length > 0)
            parser.errors.forEach((error) => printError(error));

    console.log(executed, '\n');
}

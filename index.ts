import prompt from 'prompt-sync';
import colors from 'colors';

import { evaluator } from './evaluator';
import { Enviroment, LangObject, langObjectUtil } from './object';
import { Parser, Program } from './parser';
import { Lexer, Token, TokenType } from './tokenizer';

colors.enabled = true;

const promptSync = prompt({ sigint: true });

const env = new Enviroment();

type Mode = 'repl' | 'parser' | 'parserJson' | 'lexer' | 'env';

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
                    mode = 'parserJson';
                else mode = args[0] as Mode;

                return `Switched to '${mode}' mode`;
            },
        ],
        ['#exit', () => process.exit(0)],
    ]);

    if (commands.has(command)) return commands.get(command)!(...args);

    const result = evaluator(parsed, env);

    switch (mode) {
        case 'repl':
            return langObjectUtil(result).gray;

        case 'parser':
        case 'parserJson':
            if (mode === 'parserJson') return JSON.stringify(parsed, null, 2);
            return parsed;

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
    console.log(
        executeCommand(
            input,
            new Lexer(input),
            new Parser(new Lexer(input)).parseProgram(),
            env
        ),
        '\n'
    );
}

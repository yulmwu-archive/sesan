import prompt from 'prompt-sync';
import colors from 'colors';

import {
    stdout,
    stderr,
    Options,
    Lexer,
    Token,
    TokenType,
    Parser,
    Program,
    Enviroment,
    LangObject,
    objectStringify,
    ObjectKind,
    Evaluator,
    printError,
} from '../../index';

type Mode = 'repl' | 'parser' | 'lexer' | 'env';

const defaultFilename: string = '<REPL>';

export default class {
    public promptSync = prompt({ sigint: true });
    public mode: Mode = 'repl';

    constructor(public env: Enviroment, public option: Options) {
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
                '//mode',
                (...args) => {
                    if (
                        !['repl', 'parser', 'lexer', 'env'].includes(args[0]) ||
                        args.length <= 0
                    )
                        return 'Invalid mode. valid modes are `repl`, `parser`, `lexer`, and `env`';

                    this.mode = args[0] as Mode;

                    return `Switched to '${this.mode}' mode`;
                },
            ],
            ['//exit', () => process.exit(0)],
        ]);

        if (commands.has(command)) return commands.get(command)!(...args);
        else {
            const result = new Evaluator(
                parsed,
                env,
                this.option,
                {
                    stdin: this.promptSync,
                    stdout,
                    stderr,
                },
                defaultFilename
            ).eval();

            if (result?.kind === ObjectKind.ERROR) {
                printError(result, defaultFilename, stdout, this.option);
                return '';
            }

            switch (this.mode) {
                case 'repl':
                    return objectStringify(result).gray;

                case 'parser':
                    return JSON.stringify(parsed, null, 2);

                case 'lexer':
                    const tokens: Array<Token> = [];

                    let peekToken: Token;

                    while (
                        (peekToken = lexer.nextToken()).type !== TokenType.EOF
                    )
                        tokens.push(peekToken);

                    return tokens;

                case 'env':
                    return env;
            }
        }
    }

    public start() {
        if (this.option.useStdLibAutomatically)
            new Evaluator(
                new Parser(
                    new Lexer(
                        `import('@std/lib');`,
                        {
                            ...this.option,
                            stderr,
                        },
                        defaultFilename
                    ),
                    this.option
                ).parseProgram(),
                this.env,
                this.option,
                {
                    stdin: this.promptSync,
                    stdout,
                    stderr,
                },
                defaultFilename
            ).eval();

        while (true) {
            const input = this.promptSync(
                `${`[${this.mode.toUpperCase()}]`.white.bgBlack} ${
                    `${this.env.store.size} Env(s)`.gray
                } ${'➜'.red} `
            );

            const parser = new Parser(
                new Lexer(
                    input,
                    {
                        ...this.option,
                        stderr,
                    },
                    defaultFilename
                ),
                this.option
            );

            const executed = this.executeCommand(
                input,
                new Lexer(
                    input,
                    {
                        ...this.option,
                        stderr,
                    },
                    defaultFilename
                ),
                parser.parseProgram(),
                this.env
            );

            if (executed)
                if (parser.errors.length > 0)
                    parser.errors.forEach((error) =>
                        printError(error, defaultFilename, stderr, this.option)
                    );

            console.log(executed, '\n');
        }
    }
}

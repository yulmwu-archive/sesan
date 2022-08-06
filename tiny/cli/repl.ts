import prompt from 'prompt-sync';
import colors from 'colors';

import * as Tiny from '../../index';

type Mode = 'repl' | 'parser' | 'lexer' | 'env';

const defaultFilename: string = '<REPL>';

export default class {
    public promptSync = prompt({ sigint: true });
    public mode: Mode = 'repl';

    constructor(public env: Tiny.Enviroment, public option: Tiny.Options) {
        colors.enabled = true;
    }

    public executeCommand(
        input: string,
        lexer: Tiny.Lexer,
        parsed: Tiny.Program,
        env: Tiny.Enviroment
    ):
        | Tiny.LangObject
        | Tiny.Program
        | Array<Tiny.Token>
        | Tiny.Enviroment
        | string {
        const [command, ...args] = input.split(' ');
        const commands: Map<
            string,
            (...args: Array<string>) => Tiny.LangObject | string
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
            const result = new Tiny.Evaluator(
                parsed,
                env,
                this.option,
                {
                    stdin: this.promptSync,
                    stdout: Tiny.stdout,
                    stderr: Tiny.stderr,
                },
                defaultFilename
            ).eval();

            if (result?.kind === Tiny.ObjectKind.ERROR) {
                Tiny.printError(
                    result,
                    defaultFilename,
                    Tiny.stdout,
                    this.option
                );
                return '';
            }

            switch (this.mode) {
                case 'repl':
                    return Tiny.objectStringify(result).gray;

                case 'parser':
                    return JSON.stringify(parsed, null, 2);

                case 'lexer':
                    const tokens: Array<Tiny.Token> = [];

                    let peekToken: Tiny.Token;

                    while (
                        (peekToken = lexer.nextToken()).type !==
                        Tiny.TokenType.EOF
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
            new Tiny.Evaluator(
                new Tiny.Parser(
                    new Tiny.Lexer(
                        `import('@std/lib');`,
                        {
                            ...this.option,
                            stderr: Tiny.stderr,
                        },
                        defaultFilename
                    ),
                    this.option
                ).parseProgram(),
                this.env,
                this.option,
                {
                    stdin: this.promptSync,
                    stdout: Tiny.stdout,
                    stderr: Tiny.stderr,
                },
                defaultFilename
            ).eval();

        while (true) {
            const input = this.promptSync(
                `${`[${this.mode.toUpperCase()}]`.white.bgBlack} ${
                    `${this.env.store.size} Env(s)`.gray
                } ${'➜'.red} `
            );

            const parser = new Tiny.Parser(
                new Tiny.Lexer(
                    input,
                    {
                        ...this.option,
                        stderr: Tiny.stderr,
                    },
                    defaultFilename
                ),
                this.option
            );

            const executed = this.executeCommand(
                input,
                new Tiny.Lexer(
                    input,
                    {
                        ...this.option,
                        stderr: Tiny.stderr,
                    },
                    defaultFilename
                ),
                parser.parseProgram(),
                this.env
            );

            if (executed && parser.errors.length > 0)
                parser.errors.forEach((error) =>
                    Tiny.printError(
                        error,
                        defaultFilename,
                        Tiny.stderr,
                        this.option
                    )
                );

            console.log(executed, '\n');
        }
    }
}

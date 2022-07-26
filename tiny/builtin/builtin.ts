import * as Tiny from '../../index';
import { readFileSync } from 'fs';

const importEnv: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1 || args[0]?.kind !== Tiny.ObjectKind.STRING)
        return Tiny.invalidArgument(pos, t.option);

    try {
        let fileName = (args[0] as Tiny.StringObject).value;

        if (!fileName.endsWith('.tiny')) fileName += '.tiny';

        const parsed = new Tiny.Parser(
            new Tiny.Lexer(
                readFileSync(`${t.root}${fileName}`, 'utf8'),
                {
                    ...t.option,
                    stderr: t.stdio.stderr,
                },
                fileName
            ),
            t.option
        ).parseProgram();

        parsed.errors.forEach((error) =>
            Tiny.printError(error, fileName, t.stdio.stderr, {
                ...t.option,
            })
        );

        return new Tiny.Evaluator(
            parsed,
            env,
            t.option,
            t.stdio,
            t.root
        ).eval();
    } catch (e) {
        return {
            kind: Tiny.ObjectKind.ERROR,
            message: `Could not import file: ${
                (args[0] as Tiny.StringObject).value
            }`,
            ...pos,
        };
    }
};

const typeofObject: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1) return Tiny.invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.STRING,
        value: Tiny.objectKindStringify(args[0]?.kind ?? Tiny.ObjectKind.NULL),
    };
};

const length: Tiny.Func = (args: Array<Tiny.LangObject>): Tiny.LangObject => {
    if (
        args.length !== 1 ||
        (args[0]?.kind !== Tiny.ObjectKind.ARRAY &&
            args[0]?.kind !== Tiny.ObjectKind.HASH &&
            args[0]?.kind !== Tiny.ObjectKind.STRING)
    )
        return Tiny.NULL;

    if (args[0]?.kind === Tiny.ObjectKind.ARRAY)
        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: (args[0] as Tiny.ArrayObject).value.length,
        };

    if (args[0]?.kind === Tiny.ObjectKind.STRING)
        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: (args[0] as Tiny.StringObject).value.length,
        };

    return {
        kind: Tiny.ObjectKind.NUMBER,
        value: (args[0] as Tiny.HashObject).pairs.size,
    };
};

const deleteEnv: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1 || args[0]?.kind !== Tiny.ObjectKind.STRING)
        return Tiny.invalidArgument(pos, t.option);

    env.delete(args[0].value);

    return Tiny.NULL;
};

const evalCode: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1 || args[0]?.kind !== Tiny.ObjectKind.STRING)
        return Tiny.invalidArgument(pos, t.option);

    if (!t.option.allowEval)
        return {
            kind: Tiny.ObjectKind.ERROR,
            message: Tiny.localization(t.option).builtinError.disableAllowEval,
            ...pos,
        };

    return new Tiny.Evaluator(
        new Tiny.Parser(
            new Tiny.Lexer(
                args[0].value,
                {
                    ...t.option,
                    stderr: t.stdio.stderr,
                },
                t.filename
            ),
            t.option
        ).parseProgram(),
        env,
        t.option,
        t.stdio,
        t.filename
    ).eval();
};

const evalJSCode: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1 || args[0]?.kind !== Tiny.ObjectKind.STRING)
        return Tiny.invalidArgument(pos, t.option);

    if (!t.option.allowJavaScript)
        return {
            kind: Tiny.ObjectKind.ERROR,
            message: t.messages.builtinError.disableAllowJavaScript,
            ...pos,
        };

    try {
        return eval(args[0].value);
    } catch (e) {
        if (e instanceof Error)
            return {
                kind: Tiny.ObjectKind.ERROR,
                message: Tiny.errorFormatter(
                    t.messages.builtinError.couldNotEval,
                    e.message
                ),
                ...pos,
            };

        throw e;
    }
};

const convert: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 2 || args[1]?.kind !== Tiny.ObjectKind.STRING)
        return Tiny.invalidArgument(pos, t.option);

    const to = args[1].value.toLowerCase();

    if (to === 'number') {
        switch (args[0]?.kind) {
            case Tiny.ObjectKind.NUMBER:
                return args[0];

            case Tiny.ObjectKind.BOOLEAN:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: args[0].value ? 1 : 0,
                };

            case Tiny.ObjectKind.STRING:
                const num = Number(args[0]?.value);
                return isNaN(num)
                    ? Tiny.NULL
                    : { kind: Tiny.ObjectKind.NUMBER, value: num };

            default:
                return Tiny.NULL;
        }
    } else if (to === 'string')
        return {
            kind: Tiny.ObjectKind.STRING,
            value: Tiny.objectStringify(args[0]),
        };
    else if (to === 'boolean') {
        switch (args[0]?.kind) {
            case Tiny.ObjectKind.BOOLEAN:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: args[0].value,
                };

            case Tiny.ObjectKind.NUMBER:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: args[0].value !== 0,
                };

            case Tiny.ObjectKind.STRING:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: args[0].value !== '',
                };

            default:
                return Tiny.NULL;
        }
    }

    return { kind: Tiny.ObjectKind.NULL };
};

const options: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator
): Tiny.LangObject => {
    const pairs: Map<Tiny.StringObject, Tiny.LangObject> = new Map();

    Object.entries(t.option).forEach(([key, value]) =>
        pairs.set(
            {
                kind: Tiny.ObjectKind.STRING,
                value: key,
            },
            typeof value === 'string'
                ? {
                      kind: Tiny.ObjectKind.STRING,
                      value: value,
                  }
                : {
                      kind: Tiny.ObjectKind.BOOLEAN,
                      value: value,
                  }
        )
    );

    return {
        kind: Tiny.ObjectKind.HASH,
        pairs,
    };
};

const rootDir: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.STRING,
    value: t.root,
});

const ast: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator
): Tiny.LangObject =>
    new Tiny.Evaluator(
        new Tiny.Parser(
            new Tiny.Lexer(
                JSON.stringify(t.p.statements),
                {
                    ...t.option,
                    stderr: t.stdio.stderr,
                },
                t.filename
            ),
            t.option
        ).parseProgram(),
        env,
        t.option,
        t.stdio,
        t.filename
    ).eval() as Tiny.ArrayObject;

const curr: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.HASH,
    pairs: new Map([
        [
            { kind: Tiny.ObjectKind.STRING, value: 'line' },
            { kind: Tiny.ObjectKind.NUMBER, value: pos.line },
        ],
        [
            { kind: Tiny.ObjectKind.STRING, value: 'column' },
            { kind: Tiny.ObjectKind.NUMBER, value: pos.column },
        ],
    ]),
});

const filename: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.STRING,
    value: t.filename,
});

const throwError: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1 || args[0]?.kind !== Tiny.ObjectKind.STRING)
        return Tiny.invalidArgument(pos, t.option);

    Tiny.printError(
        {
            ...pos,
            message: args[0].value,
        },
        t.filename,
        t.stdio.stderr,
        t.option
    );

    return Tiny.NULL;
};

export const builtin: Map<string, Tiny.Func> = new Map([
    ['import', importEnv],
    ['typeof', typeofObject],
    ['throw', throwError],
    ['delete', deleteEnv],
    ['eval', evalCode],
    ['js', evalJSCode],
    ['convert', convert],
    ['options', options],
    ['null', () => Tiny.NULL],
    ['__builtin_length', length],
    ['__root', rootDir],
    ['__ast', ast],
    ['__pos', curr],
    ['__filename', filename],
]);

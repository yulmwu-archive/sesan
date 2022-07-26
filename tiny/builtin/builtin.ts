import {
    ArrayObject,
    Enviroment,
    HashObject,
    LangObject,
    ObjectKind,
    objectKindStringify,
    objectStringify,
    StringObject,
    Evaluator,
    NULL,
    Parser,
    Position,
    Lexer,
    printError,
    Func,
    invalidArgument,
    localization,
    errorFormatter,
    NumberObject,
} from '../../index';
import { readFileSync } from 'fs';

const importEnv: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos, t.option);

    try {
        let fileName = (args[0] as StringObject).value;

        if (!fileName.endsWith('.tiny')) fileName += '.tiny';

        const parsed = new Parser(
            new Lexer(
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
            printError(error, fileName, t.stdio.stderr, {
                ...t.option,
            })
        );

        return new Evaluator(parsed, env, t.option, t.stdio, t.root).eval();
    } catch (e) {
        return {
            kind: ObjectKind.ERROR,
            message: `Could not import file: ${
                (args[0] as StringObject).value
            }`,
            ...pos,
        };
    }
};

const typeofObject: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1) return invalidArgument(pos, t.option);

    return {
        kind: ObjectKind.STRING,
        value: objectKindStringify(args[0]?.kind ?? ObjectKind.NULL),
    };
};

const length: Func = (args: Array<LangObject>): LangObject => {
    if (
        args.length !== 1 ||
        (args[0]?.kind !== ObjectKind.ARRAY &&
            args[0]?.kind !== ObjectKind.HASH &&
            args[0]?.kind !== ObjectKind.STRING)
    )
        return NULL;

    if (args[0]?.kind === ObjectKind.ARRAY)
        return {
            kind: ObjectKind.NUMBER,
            value: (args[0] as ArrayObject).value.length,
        };

    if (args[0]?.kind === ObjectKind.STRING)
        return {
            kind: ObjectKind.NUMBER,
            value: (args[0] as StringObject).value.length,
        };

    return {
        kind: ObjectKind.NUMBER,
        value: (args[0] as HashObject).pairs.size,
    };
};

const deleteEnv: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos, t.option);

    env.delete(args[0].value);

    return NULL;
};

const evalCode: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos, t.option);

    if (!t.option.allowEval)
        return {
            kind: ObjectKind.ERROR,
            message: localization(t.option).builtinError.disableAllowEval,
            ...pos,
        };

    return new Evaluator(
        new Parser(
            new Lexer(
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

const evalJSCode: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos, t.option);

    if (!t.option.allowJavaScript)
        return {
            kind: ObjectKind.ERROR,
            message: localization(t.option).builtinError.disableAllowJavaScript,
            ...pos,
        };

    try {
        return eval(args[0].value);
    } catch (e) {
        if (e instanceof Error)
            return {
                kind: ObjectKind.ERROR,
                message: errorFormatter(
                    localization(t.option).builtinError.couldNotEval,
                    e.message
                ),
                ...pos,
            };

        throw e;
    }
};

const convert: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 2 || args[1]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos, t.option);

    const to = args[1].value.toLowerCase();

    if (to === 'number') {
        switch (args[0]?.kind) {
            case ObjectKind.NUMBER:
                return args[0];

            case ObjectKind.BOOLEAN:
                return {
                    kind: ObjectKind.NUMBER,
                    value: args[0].value ? 1 : 0,
                };

            case ObjectKind.STRING:
                const num = Number(args[0]?.value);
                return isNaN(num)
                    ? NULL
                    : { kind: ObjectKind.NUMBER, value: num };

            default:
                return NULL;
        }
    } else if (to === 'string')
        return { kind: ObjectKind.STRING, value: objectStringify(args[0]) };
    else if (to === 'boolean') {
        switch (args[0]?.kind) {
            case ObjectKind.BOOLEAN:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: args[0].value,
                };

            case ObjectKind.NUMBER:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: args[0].value !== 0,
                };

            case ObjectKind.STRING:
                return {
                    kind: ObjectKind.BOOLEAN,
                    value: args[0].value !== '',
                };

            default:
                return NULL;
        }
    }

    return { kind: ObjectKind.NULL };
};

const options: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator
): LangObject => {
    const pairs: Map<StringObject, LangObject> = new Map();

    Object.entries(t.option).forEach(([key, value]) =>
        pairs.set(
            {
                kind: ObjectKind.STRING,
                value: key,
            },
            typeof value === 'string'
                ? {
                      kind: ObjectKind.STRING,
                      value: value,
                  }
                : {
                      kind: ObjectKind.BOOLEAN,
                      value: value,
                  }
        )
    );

    return {
        kind: ObjectKind.HASH,
        pairs,
    };
};

const newLine: Func = (args: Array<LangObject>): LangObject => ({
    kind: ObjectKind.STRING,
    value: '\n',
});

const rootDir: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator
): LangObject => ({
    kind: ObjectKind.STRING,
    value: t.root,
});

const ast: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator
): LangObject =>
    new Evaluator(
        new Parser(
            new Lexer(
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
    ).eval() as ArrayObject;

const curr: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => ({
    kind: ObjectKind.HASH,
    pairs: new Map([
        [
            { kind: ObjectKind.STRING, value: 'line' },
            { kind: ObjectKind.NUMBER, value: pos.line },
        ],
        [
            { kind: ObjectKind.STRING, value: 'column' },
            { kind: ObjectKind.NUMBER, value: pos.column },
        ],
    ]),
});

const filename: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator
): LangObject => ({
    kind: ObjectKind.STRING,
    value: t.filename,
});

const throwError: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos, t.option);

    printError(
        {
            ...pos,
            message: args[0].value,
        },
        t.filename,
        t.stdio.stderr,
        t.option
    );

    return NULL;
};

export const builtin: Map<string, Func> = new Map([
    ['import', importEnv],
    ['typeof', typeofObject],
    ['throw', throwError],
    ['delete', deleteEnv],
    ['eval', evalCode],
    ['js', evalJSCode],
    ['convert', convert],
    ['options', options],
    ['null', () => NULL],
    ['__builtin_length', length],
    ['__root', rootDir],
    ['__ast', ast],
    ['__pos', curr]
]);

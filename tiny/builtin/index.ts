import { Evaluator, NULL } from '../evaluator';
import {
    ArrayObject,
    BuiltinFunction,
    Enviroment,
    HashObject,
    LangObject,
    ObjectKind,
    objectKindStringify,
    objectStringify,
    StringObject,
} from '../object';
import { Parser, Position } from '../parser';
import { Lexer } from '../tokenizer';
import { readFileSync } from 'fs';
import { print, readLine, throwError } from './io';
import { push, pop, shift, unshift, slice, forEach } from './array';
import { decoratorFunc } from './decorator';

type Func = Omit<BuiltinFunction, 'kind'>['func'];

const invalidArgument = (pos: Position): LangObject => ({
    kind: ObjectKind.ERROR,
    message: 'Invalid arguments',
    ...pos,
});

const builtinsEval: Map<string, Func> = new Map();

export default (name: string, env: Enviroment): LangObject | null => {
    const func: Func | undefined = new Map([
        ...builtinsEval,
        ['import', importEnv],
        ['typeof', typeofObject],
        ['throw', throwError],
        ['delete', deleteEnv],
        ['eval', evalCode],
        ['js', evalJSCode],
        ['convert', convert],
        ['null', () => NULL],
        ['__builtin_push', push],
        ['__builtin_length', length],
        ['__builtin_pop', pop],
        ['__builtin_shift', shift],
        ['__builtin_unshift', unshift],
        ['__builtin_slice', slice],
        ['__builtin_print', print],
        ['__builtin_readline', readLine],
        ['__builtin__arguments', getArguments],
        ['__new_line', newLine],
        ['__builtin_forEach', forEach],
        ['__root', rootDir],
        ['__ast', ast],
        ['__pos', curr],
        ['@func', decoratorFunc],
    ]).get(name);

    if (!func) return null;

    return {
        kind: ObjectKind.BUILTIN,
        func,
    };
};

const getArguments: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1) return invalidArgument(pos);

    return {
        kind: ObjectKind.ARRAY,
        value:
            t.__builtin__arguments.get((args[0] as StringObject).value) ?? [],
    };
};

const importEnv: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos);

    try {
        let fileName = (args[0] as StringObject).value;

        if (!fileName.endsWith('.tiny')) fileName += '.tiny';

        return new Evaluator(
            new Parser(
                new Lexer(readFileSync(`${t.root}${fileName}`, 'utf8'), {
                    ...t.option,
                    stderr: t.stdio.stderr,
                })
            ).parseProgram(),
            env,
            t.option,
            t.stdio,
            t.root
        ).eval();
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
    if (args.length !== 1) return invalidArgument(pos);

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
        return invalidArgument(pos);

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
        return invalidArgument(pos);

    if (!t.option.allowEval)
        return {
            kind: ObjectKind.ERROR,
            message: 'allowEval is not allowed',
            ...pos,
        };

    return new Evaluator(
        new Parser(
            new Lexer(args[0].value, {
                ...t.option,
                stderr: t.stdio.stderr,
            })
        ).parseProgram(),
        env,
        t.option
    ).eval();
};

const evalJSCode: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos);

    if (!t.option.allowJavaScript)
        return {
            kind: ObjectKind.ERROR,
            message: 'allowJavaScript is not allowed',
            ...pos,
        };

    try {
        return eval(args[0].value);
    } catch (e) {
        if (e instanceof Error)
            return {
                kind: ObjectKind.ERROR,
                message: `Could not eval JS code: ${e.message}`,
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
        return invalidArgument(pos);

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
            new Lexer(JSON.stringify(t.p.statements), {
                ...t.option,
                stderr: t.stdio.stderr,
            })
        ).parseProgram(),
        env,
        t.option
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

export { Func, invalidArgument, builtinsEval };

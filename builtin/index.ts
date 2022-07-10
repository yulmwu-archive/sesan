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
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';
import { readFileSync } from 'fs';
import { print, printError, readLine, throwError } from './io';
import { push, pop, shift, unshift, slice, forEach } from './array';
import { Options } from '../options';

type Func = Omit<BuiltinFunction, 'kind'>['func'];

const invalidArgument: LangObject = {
    kind: ObjectKind.ERROR,
    message: 'Invalid arguments',
};

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
        ['__builtin_print_error', printError],
        ['__builtin_readline', readLine],
        ['__builtin__arguments', getArguments],
        ['__new_line', newLine],
        ['__builtin_forEach', forEach],
    ]).get(name);

    if (!func) return null;

    return {
        kind: ObjectKind.BUILTIN,
        func: func,
    };
};

const getArguments: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    option: Options,
    t: Evaluator
): LangObject => {
    if (args.length !== 1) return invalidArgument;

    return {
        kind: ObjectKind.ARRAY,
        value:
            t.__builtin__arguments.get((args[0] as StringObject).value) ?? [],
    };
};

const importEnv: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    option: Options
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument;

    try {
        let fileName = (args[0] as StringObject).value;

        if (!fileName.endsWith('.tiny')) fileName += '.tiny';

        return new Evaluator(
            new Parser(
                new Lexer(readFileSync(fileName, 'utf8'))
            ).parseProgram(),
            env,
            option
        ).eval();
    } catch (e) {
        return {
            kind: ObjectKind.ERROR,
            message: `Could not import file: ${
                (args[0] as StringObject).value
            }`,
        };
    }
};

const typeofObject: Func = (args: Array<LangObject>): LangObject => {
    if (args.length !== 1) return invalidArgument;

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
    env: Enviroment
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument;

    env.delete(args[0].value);

    return NULL;
};

const evalCode: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    option: Options
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument;

    if (!option.allowEval)
        return {
            kind: ObjectKind.ERROR,
            message: 'allowEval is not allowed',
        };

    return new Evaluator(
        new Parser(new Lexer(args[0].value)).parseProgram(),
        env,
        option
    ).eval();
};

const evalJSCode: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    option: Options
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument;

    if (!option.allowJavaScript)
        return {
            kind: ObjectKind.ERROR,
            message: 'allowJavaScript is not allowed',
        };

    try {
        return eval(args[0].value);
    } catch (e) {
        if (e instanceof Error)
            return {
                kind: ObjectKind.ERROR,
                message: `Could not eval JS code: ${e.message}`,
            };

        throw e;
    }
};

const convert: Func = (args: Array<LangObject>): LangObject => {
    if (args.length !== 2 || args[1]?.kind !== ObjectKind.STRING)
        return invalidArgument;

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

export { Func, invalidArgument, builtinsEval };

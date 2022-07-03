import { evaluator, NULL, __builtin__arguments } from '../evaluator';
import {
    ArrayObject,
    BuiltinFunction,
    Enviroment,
    HashObject,
    LangObject,
    ObjectKind,
    StringObject,
} from '../object';
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';
import { readFileSync } from 'fs';
import { print, printError, readLine } from './io';
import { push, pop, shift, unshift, slice, forEach } from './array';

export type Func = Omit<BuiltinFunction, 'kind'>['func'];

export default (name: string, env: Enviroment): LangObject => {
    const func: Func | undefined = new Map([
        ['import', importEnv],
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
        ['@', () => NULL],
    ]).get(name);

    if (!func) return NULL;

    return {
        kind: ObjectKind.BUILTIN,
        func: func,
    };
};

const getArguments: Func = (args: Array<LangObject>): LangObject => {
    if (args.length <= 0)
        return {
            kind: ObjectKind.ERROR,
            message: 'Arguments must be passed to __builtin__arguments',
        };

    return {
        kind: ObjectKind.ARRAY,
        value: __builtin__arguments.get((args[0] as StringObject).value) ?? [],
    };
};

const importEnv: Func = (
    args: Array<LangObject>,
    env: Enviroment
): LangObject => {
    if (args.length <= 0 || args[0]?.kind !== ObjectKind.STRING)
        return {
            kind: ObjectKind.ERROR,
            message: 'Invalid arguments',
        };

    try {
        let fileName = (args[0] as StringObject).value;

        if (!fileName.endsWith('.tiny')) fileName += '.tiny';

        return evaluator(
            new Parser(
                new Lexer(readFileSync(fileName, 'utf8'))
            ).parseProgram(),
            env
        );
    } catch (e) {
        return {
            kind: ObjectKind.ERROR,
            message: `Could not import file: ${
                (args[0] as StringObject).value
            }`,
        };
    }
};

const newLine: Func = (args: Array<LangObject>): LangObject => ({
    kind: ObjectKind.STRING,
    value: '\n',
});

const length: Func = (args: Array<LangObject>): LangObject => {
    if (
        args.length < 1 ||
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

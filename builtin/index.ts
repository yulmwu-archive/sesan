import { evaluator, NULL, __builtin__arguments } from '../evaluator';
import {
    BuiltinFunction,
    Enviroment,
    LangObject,
    langObjectUtil,
    ObjectKind,
    StringObject,
} from '../object';
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';
import { readFileSync } from 'fs';

import prompt from 'prompt-sync';

const promptSync = prompt({ sigint: true });

type Func = Omit<BuiltinFunction, 'kind'>['func'];

export default (name: string, env: Enviroment): LangObject => {
    const func: Func | undefined = new Map([
        ['import', importEnv],
        ['__builtin_print', print],
        ['__builtin_print_error', printError],
        ['__builtin_readline', readLine],
        ['__builtin__arguments', getArguments],
        ['__new_line', newLine],
        ['@', () => NULL],
    ]).get(name);

    if (!func) return NULL;

    return {
        kind: ObjectKind.BUILTIN,
        func: func,
    };
};

const print: Func = (args: Array<LangObject>): LangObject => {
    if (args.length <= 0 || args[0]?.kind !== ObjectKind.ARRAY) return NULL;

    process.stdout.write(
        `${args[0]?.value
            .map((arg) => langObjectUtil(arg))
            .join(' ')}${langObjectUtil(args[1])}`
    );

    return NULL;
};

const printError: Func = (args: Array<LangObject>): LangObject => {
    if (args.length <= 0 || args[0]?.kind !== ObjectKind.ARRAY) return NULL;

    process.stdout.write(
        `${args[0]?.value
            .map((arg) => langObjectUtil(arg))
            .join(' ')}${langObjectUtil(args[1])}`
    );

    return NULL;
};

const readLine: Func = (args: Array<LangObject>): LangObject => {
    if (args[0]?.kind !== ObjectKind.ARRAY) return NULL;
    return {
        kind: ObjectKind.STRING,
        value: promptSync(
            args[0]?.value.map((arg) => langObjectUtil(arg)).join(' ')
        ),
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

    let fileName = (args[0] as StringObject).value;

    if (fileName.startsWith('@std/'))
        fileName = fileName.replace('@std/', './stdlib/');

    try {
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

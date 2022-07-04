import prompt from 'prompt-sync';
import { Func, invalidArgument } from '.';
import { NULL, printError as printError_ } from '../evaluator';
import { Enviroment, LangObject, langObjectUtil, ObjectKind } from '../object';

const promptSync = prompt({ sigint: true });

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

const throwError: Func = (args: Array<LangObject>): LangObject => {
    if (args.length <= 0 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument;

    printError_(args[0].value);

    return NULL;
};

export { print, printError, readLine, throwError };

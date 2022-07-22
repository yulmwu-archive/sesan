import { Func, invalidArgument } from '.';
import { Evaluator, NULL, printError as printError_ } from '../evaluator';
import { Enviroment, LangObject, objectStringify, ObjectKind } from '../object';
import { Position } from '../parser';

const print: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator
): LangObject => {
    if (args[0]?.kind !== ObjectKind.ARRAY) return NULL;

    t.stdio.stdout(
        `${args[0]?.value
            .map((arg) => objectStringify(arg))
            .join(' ')}${objectStringify(args[1])}`
    );

    return NULL;
};

const readLine: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator
): LangObject => {
    if (args[0]?.kind !== ObjectKind.ARRAY) return NULL;

    return {
        kind: ObjectKind.STRING,
        value: t.stdio.stdin(
            args[0]?.value.map((arg) => objectStringify(arg)).join(' ')
        ),
    };
};

const throwError: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.STRING)
        return invalidArgument(pos);

    printError_(
        {
            ...pos,
            message: args[0].value,
        },
        t.stdio.stderr,
        t.option
    );

    return NULL;
};

export { print, readLine, throwError };

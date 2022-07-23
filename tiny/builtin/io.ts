import {
    Enviroment,
    LangObject,
    objectStringify,
    ObjectKind,
    Evaluator,
    NULL,
    Func,
} from '../../index';

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

export const io: Map<string, Func> = new Map([
    ['__builtin_print', print],
    ['__builtin_readline', readLine],
]);

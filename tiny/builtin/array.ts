import { Func, invalidArgument } from '.';
import {
    Position,
    Evaluator,
    NULL,
    ArrayObject,
    Enviroment,
    FunctionObject,
    LangObject,
    ObjectKind,
    objectStringify,
} from '../../index';

const push: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 2 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value, args[1]],
    };
};

const pop: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value.slice(0, -1)],
    };
};

const shift: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value.slice(1)],
    };
};

const unshift: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 2 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: ObjectKind.ARRAY,
        value: [args[1], ...(args[0] as ArrayObject).value],
    };
};

const slice: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (
        args.length !== 3 ||
        args[0]?.kind !== ObjectKind.ARRAY ||
        args[1]?.kind !== ObjectKind.NUMBER ||
        args[2]?.kind !== ObjectKind.NUMBER
    )
        return invalidArgument(pos, t.option);

    return {
        kind: ObjectKind.ARRAY,
        value: (args[0] as ArrayObject).value.slice(
            args[1].value,
            args[2].value
        ),
    };
};

const join: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (
        args.length !== 2 ||
        args[0]?.kind !== ObjectKind.ARRAY ||
        args[1]?.kind !== ObjectKind.STRING
    )
        return invalidArgument(pos, t.option);

    return {
        kind: ObjectKind.STRING,
        value: (args[0] as ArrayObject).value
            .map((v) => objectStringify(v))
            .join(args[1].value),
    };
};

const forEach: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (
        args.length !== 2 ||
        args[0]?.kind !== ObjectKind.ARRAY ||
        args[1]?.kind !== ObjectKind.FUNCTION
    )
        return invalidArgument(pos, t.option);

    const array = args[0] as ArrayObject;
    const func = args[1] as FunctionObject;

    array.value.forEach((value, index) =>
        t.applyFunction(
            func,
            '',
            [
                value,
                {
                    kind: ObjectKind.NUMBER,
                    value: index,
                },
            ],
            env,
            pos
        )
    );

    return NULL;
};

export const array: Map<string, Func> = new Map([
    ['__builtin_push', push],
    ['__builtin_pop', pop],
    ['__builtin_shift', shift],
    ['__builtin_unshift', unshift],
    ['__builtin_slice', slice],
    ['__builtin_join', join],
    ['__builtin_forEach', forEach],
]);

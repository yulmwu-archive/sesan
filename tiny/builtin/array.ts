import { Func, invalidArgument } from '.';
import * as Tiny from '../../index';

const push: Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 2 || args[0]?.kind !== Tiny.ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [...(args[0] as Tiny.ArrayObject).value, args[1]],
    };
};

const pop: Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1 || args[0]?.kind !== Tiny.ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [...(args[0] as Tiny.ArrayObject).value.slice(0, -1)],
    };
};

const shift: Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 1 || args[0]?.kind !== Tiny.ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [...(args[0] as Tiny.ArrayObject).value.slice(1)],
    };
};

const unshift: Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (args.length !== 2 || args[0]?.kind !== Tiny.ObjectKind.ARRAY)
        return invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [args[1], ...(args[0] as Tiny.ArrayObject).value],
    };
};

const slice: Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (
        args.length !== 3 ||
        args[0]?.kind !== Tiny.ObjectKind.ARRAY ||
        args[1]?.kind !== Tiny.ObjectKind.NUMBER ||
        args[2]?.kind !== Tiny.ObjectKind.NUMBER
    )
        return invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: (args[0] as Tiny.ArrayObject).value.slice(
            args[1].value,
            args[2].value
        ),
    };
};

const join: Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (
        args.length !== 2 ||
        args[0]?.kind !== Tiny.ObjectKind.ARRAY ||
        args[1]?.kind !== Tiny.ObjectKind.STRING
    )
        return invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.STRING,
        value: (args[0] as Tiny.ArrayObject).value
            .map((v) => Tiny.objectStringify(v))
            .join(args[1].value),
    };
};

const forEach: Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (
        args.length !== 2 ||
        args[0]?.kind !== Tiny.ObjectKind.ARRAY ||
        args[1]?.kind !== Tiny.ObjectKind.FUNCTION
    )
        return invalidArgument(pos, t.option);

    const array = args[0] as Tiny.ArrayObject;
    const func = args[1] as Tiny.FunctionObject;

    array.value.forEach((value, index) =>
        t.applyFunction(
            func,
            '',
            [
                value,
                {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: index,
                },
            ],
            env,
            pos,
            Tiny.NULL
        )
    );

    return Tiny.NULL;
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

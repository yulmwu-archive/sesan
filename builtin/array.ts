import { Func, invalidArgument } from '.';
import { NULL } from '../evaluator';
import { applyFunction } from '../evaluator/evaluator';
import {
    ArrayObject,
    Enviroment,
    FunctionObject,
    LangObject,
    ObjectKind,
} from '../object';
import { Options } from '../options';

const push: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 2 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument;

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value, args[1]],
    };
};

const pop: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 1 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument;

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value.slice(0, -1)],
    };
};

const shift: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 1 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument;

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value.slice(1)],
    };
};

const unshift: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 2 || args[0]?.kind !== ObjectKind.ARRAY)
        return invalidArgument;

    return {
        kind: ObjectKind.ARRAY,
        value: [args[1], ...(args[0] as ArrayObject).value],
    };
};

const slice: Func = (args: Array<LangObject>): LangObject => {
    if (
        args.length < 3 ||
        args[0]?.kind !== ObjectKind.ARRAY ||
        args[1]?.kind !== ObjectKind.NUMBER ||
        args[2]?.kind !== ObjectKind.NUMBER
    )
        return invalidArgument;

    return {
        kind: ObjectKind.ARRAY,
        value: (args[0] as ArrayObject).value.slice(
            args[1].value,
            args[2].value
        ),
    };
};

const forEach: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    option: Options
): LangObject => {
    if (
        args.length < 2 ||
        args[0]?.kind !== ObjectKind.ARRAY ||
        args[1]?.kind !== ObjectKind.FUNCTION
    )
        return invalidArgument;

    const array = args[0] as ArrayObject;
    const func = args[1] as FunctionObject;

    array.value.forEach((value, index) =>
        applyFunction(
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
            option
        )
    );

    return NULL;
};

export { push, pop, shift, unshift, slice, forEach };

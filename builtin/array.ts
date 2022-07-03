import { Func } from '.';
import { NULL } from '../evaluator';
import { ArrayObject, LangObject, ObjectKind } from '../object';

const push: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 2 || args[0]?.kind !== ObjectKind.ARRAY) return NULL;

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value, args[1]],
    };
};

const pop: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 1 || args[0]?.kind !== ObjectKind.ARRAY) return NULL;

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value.slice(0, -1)],
    };
};

const shift: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 1 || args[0]?.kind !== ObjectKind.ARRAY) return NULL;

    return {
        kind: ObjectKind.ARRAY,
        value: [...(args[0] as ArrayObject).value.slice(1)],
    };
};

const unshift: Func = (args: Array<LangObject>): LangObject => {
    if (args.length < 2 || args[0]?.kind !== ObjectKind.ARRAY) return NULL;

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
        return NULL;

    return {
        kind: ObjectKind.ARRAY,
        value: (args[0] as ArrayObject).value.slice(
            args[1].value,
            args[2].value
        ),
    };
};

export { push, pop, shift, unshift, slice };

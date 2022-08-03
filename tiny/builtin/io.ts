import * as Tiny from '../../index';

const print: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator
): Tiny.LangObject => {
    if (args[0]?.kind !== Tiny.ObjectKind.ARRAY) return Tiny.NULL;

    t.stdio.stdout(
        `${args[0]?.value
            .map((arg) => Tiny.objectStringify(arg))
            .join(' ')}${Tiny.objectStringify(args[1])}`
    );

    return Tiny.NULL;
};

export const io: Map<string, Tiny.Func> = new Map([['__builtin_print', print]]);

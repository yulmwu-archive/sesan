import * as Tiny from '../../index';

const print: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator
): Tiny.LangObject => {
    if (parameters[0]?.kind !== Tiny.ObjectKind.ARRAY) return Tiny.NULL;

    evaluator.option.stdio.stdout(
        `${parameters[0]?.value
            .map((arg) => Tiny.objectStringify(arg))
            .join(' ')}${Tiny.objectStringify(parameters[1])}`
    );

    return Tiny.NULL;
};

export const io: Map<string, Tiny.Func> = new Map([['__builtin_print', print]]);

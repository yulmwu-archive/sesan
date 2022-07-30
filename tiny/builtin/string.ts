import * as Tiny from '../../index';

const regex: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (
        args.length !== 3 ||
        args[0]?.kind !== Tiny.ObjectKind.STRING ||
        args[1]?.kind !== Tiny.ObjectKind.STRING ||
        args[2]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(pos, t.option);

    const regex = new RegExp(args[1].value, 'g');

    const str = args[2].value;

    switch (args[0].value) {
        case 'match':
            return {
                kind: Tiny.ObjectKind.ARRAY,
                value:
                    str.match(regex)?.map((s) => ({
                        kind: Tiny.ObjectKind.STRING,
                        value: s,
                    })) ?? [],
            };

        case 'test':
            return {
                kind: Tiny.ObjectKind.BOOLEAN,
                value: regex.test(str),
            };

        default:
            return Tiny.invalidArgument(pos, t.option);
    }
};

const replace: Tiny.Func = (
    args: Array<Tiny.LangObject>,
    env: Tiny.Enviroment,
    t: Tiny.Evaluator,
    pos: Tiny.Position
): Tiny.LangObject => {
    if (
        args.length !== 3 ||
        args[0]?.kind !== Tiny.ObjectKind.STRING ||
        args[1]?.kind !== Tiny.ObjectKind.STRING ||
        args[2]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(pos, t.option);

    return {
        kind: Tiny.ObjectKind.STRING,
        value: args[0].value.replaceAll(args[1].value, args[2].value),
    };
};

export const strings: Map<string, Tiny.Func> = new Map([
    ['regex', regex],
    ['__builtin_replace', replace],
]);

import * as Tiny from '../../index';

const regex: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 3 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING ||
        parameters[1]?.kind !== Tiny.ObjectKind.STRING ||
        parameters[2]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(position, evaluator.options);

    const regex = new RegExp(parameters[1].value, 'g');

    const str = parameters[2].value;

    switch (parameters[0].value) {
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
            return Tiny.invalidArgument(position, evaluator.options);
    }
};

const replace: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 3 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING ||
        parameters[1]?.kind !== Tiny.ObjectKind.STRING ||
        parameters[2]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(position, evaluator.options);

    return {
        kind: Tiny.ObjectKind.STRING,
        value: parameters[0].value.replaceAll(
            parameters[1].value,
            parameters[2].value
        ),
    };
};

export const strings: Map<string, Tiny.Func> = new Map([
    ['regex', regex],
    ['__builtin_replace', replace],
]);

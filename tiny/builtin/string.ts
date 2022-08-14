import * as Tiny from '../../index';

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

const regExp: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[0]?.kind !== Tiny.ObjectKind.HASH ||
        parameters[1]?.kind !== Tiny.ObjectKind.HASH
    )
        return Tiny.invalidArgument(position, evaluator.options);

    const get = (
        hash: Map<Tiny.NumberObject | Tiny.StringObject, Tiny.LangObject>,
        key: string,
        defaultType: 'string' | 'hash' = 'string'
    ) =>
        new Map([...hash].map(([key, value]) => [key.value, value])).get(key) ??
        (defaultType === 'string'
            ? { kind: Tiny.ObjectKind.STRING, value: '' }
            : {
                  kind: Tiny.ObjectKind.HASH,
                  value: new Map(),
              });

    const regex = new RegExp(
        (get(parameters[0].pairs, 'pattern') as Tiny.StringObject)?.value,
        (get(parameters[0].pairs, 'flags') as Tiny.StringObject)?.value
    );

    const str = (get(parameters[1].pairs, 'str') as Tiny.StringObject)?.value;

    switch ((get(parameters[1].pairs, 'type') as Tiny.StringObject)?.value) {
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

        case 'replace':
            return {
                kind: Tiny.ObjectKind.STRING,
                value: str.replace(regex, (match) =>
                    (
                        get(
                            (parameters[1] as Tiny.HashObject).pairs,
                            'replace'
                        ) as Tiny.StringObject
                    )?.value.replaceAll('$1', match)
                ),
            };
    }

    return Tiny.invalidArgument(position, evaluator.options);
};

export const strings: Map<string, Tiny.Func> = new Map([
    ['regExp', regExp],
    ['__builtin_replace', replace],
]);

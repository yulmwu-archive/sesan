import * as Sesan from '../../index'

const replace: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (
        parameters.length !== 3 ||
        parameters[0]?.kind !== Sesan.ObjectKind.STRING ||
        parameters[1]?.kind !== Sesan.ObjectKind.STRING ||
        parameters[2]?.kind !== Sesan.ObjectKind.STRING
    )
        return Sesan.invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.STRING,
        value: parameters[0].value.replaceAll(parameters[1].value, parameters[2].value),
    }
}

const regExp: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 2 || parameters[0]?.kind !== Sesan.ObjectKind.OBJECT || parameters[1]?.kind !== Sesan.ObjectKind.OBJECT)
        return Sesan.invalidArgument(position, evaluator.option)

    const get = (object: Map<Sesan.NumberObject | Sesan.StringObject, Sesan.LangObject>, key: string, defaultType: 'string' | 'object' = 'string') =>
        new Map([...object].map(([key, value]) => [key.value, value])).get(key) ??
        (defaultType === 'string'
            ? { kind: Sesan.ObjectKind.STRING, value: '' }
            : {
                  kind: Sesan.ObjectKind.OBJECT,
                  value: new Map(),
              })

    const regex = new RegExp(
        (get(parameters[0].pairs, 'pattern') as Sesan.StringObject)?.value,
        (get(parameters[0].pairs, 'flags') as Sesan.StringObject)?.value
    )

    const str = (get(parameters[1].pairs, 'str') as Sesan.StringObject)?.value

    switch ((get(parameters[1].pairs, 'type') as Sesan.StringObject)?.value) {
        case 'match':
            return {
                kind: Sesan.ObjectKind.ARRAY,
                value:
                    str.match(regex)?.map((s) => ({
                        kind: Sesan.ObjectKind.STRING,
                        value: s,
                    })) ?? [],
            }

        case 'test':
            return {
                kind: Sesan.ObjectKind.BOOLEAN,
                value: regex.test(str),
            }

        case 'replace':
            return {
                kind: Sesan.ObjectKind.STRING,
                value: str.replace(regex, (match) =>
                    (get((parameters[1] as Sesan.ObjectObject).pairs, 'replace') as Sesan.StringObject)?.value.replaceAll('$1', match)
                ),
            }
    }

    return Sesan.invalidArgument(position, evaluator.option)
}

const split: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 2 || parameters[0]?.kind !== Sesan.ObjectKind.STRING) return Sesan.invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.ARRAY,
        value: (parameters[0] as Sesan.StringObject).value.split((parameters[1] as Sesan.StringObject).value).map((s) => ({
            kind: Sesan.ObjectKind.STRING,
            value: s,
        })),
    }
}

export const strings: Map<string, Sesan.Func> = new Map([
    ['regExp', regExp],
    ['__builtin_replace', replace],
    ['__builtin_split', split],
])

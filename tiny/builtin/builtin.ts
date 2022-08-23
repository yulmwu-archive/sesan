import * as Tiny from '../../index'

const importEnviroment: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Tiny.ObjectKind.STRING) return Tiny.invalidArgument(position, evaluator.option)

    return evaluator.importEnv((parameters[0] as Tiny.StringObject).value, enviroment, evaluator, position)
}

const length: Tiny.Func = (parameters: Array<Tiny.LangObject>): Tiny.LangObject => {
    if (
        parameters.length !== 1 ||
        (parameters[0]?.kind !== Tiny.ObjectKind.ARRAY &&
            parameters[0]?.kind !== Tiny.ObjectKind.OBJECT &&
            parameters[0]?.kind !== Tiny.ObjectKind.STRING)
    )
        return Tiny.NULL

    if (parameters[0]?.kind === Tiny.ObjectKind.ARRAY)
        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: (parameters[0] as Tiny.ArrayObject).value.length,
        }

    if (parameters[0]?.kind === Tiny.ObjectKind.STRING)
        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: (parameters[0] as Tiny.StringObject).value.length,
        }

    return {
        kind: Tiny.ObjectKind.NUMBER,
        value: (parameters[0] as Tiny.ObjectObject).pairs.size,
    }
}

const split: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 2 || parameters[0]?.kind !== Tiny.ObjectKind.STRING) return Tiny.invalidArgument(position, evaluator.option)

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: (parameters[0] as Tiny.StringObject).value.split((parameters[1] as Tiny.StringObject).value).map((s) => ({
            kind: Tiny.ObjectKind.STRING,
            value: s,
        })),
    }
}

const evalCode: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Tiny.ObjectKind.STRING) return Tiny.invalidArgument(position, evaluator.option)

    if (!evaluator.option.allowEval)
        return {
            kind: Tiny.ObjectKind.ERROR,
            message: Tiny.localization(evaluator.option).builtinError.disableAllowEval,
            ...position,
        }

    return new Tiny.Evaluator(
        new Tiny.Parser(
            new Tiny.Lexer(
                parameters[0].value,
                {
                    ...evaluator.option,
                    stderr: evaluator.option.stdio.stderr,
                },
                evaluator.option.filename
            ),
            evaluator.option
        ).parseProgram(),
        enviroment,
        evaluator.option
    ).eval()
}

const evalJSCode: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Tiny.ObjectKind.STRING) return Tiny.invalidArgument(position, evaluator.option)

    if (!evaluator.option.allowJavaScript)
        return {
            kind: Tiny.ObjectKind.ERROR,
            message: evaluator.messages.builtinError.disableAllowJavaScript,
            ...position,
        }

    try {
        return eval(parameters[0].value)
    } catch (e) {
        if (e instanceof Error)
            return {
                kind: Tiny.ObjectKind.ERROR,
                message: Tiny.errorFormatter(evaluator.messages.builtinError.couldNotEval, e.message),
                ...position,
            }

        return {
            kind: Tiny.ObjectKind.ERROR,
            message: Tiny.errorFormatter(evaluator.messages.builtinError.couldNotEval, `${e}`),
            ...position,
        }
    }
}

const toString: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 1) return Tiny.invalidArgument(position, evaluator.option)

    return {
        kind: Tiny.ObjectKind.STRING,
        value: Tiny.objectStringify(parameters[0]),
    }
}

const toNumber: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 1) return Tiny.invalidArgument(position, evaluator.option)

    switch (parameters[0]?.kind) {
        case Tiny.ObjectKind.NUMBER:
            return parameters[0]

        case Tiny.ObjectKind.BOOLEAN:
            return {
                kind: Tiny.ObjectKind.NUMBER,
                value: parameters[0].value ? 1 : 0,
            }

        case Tiny.ObjectKind.STRING:
            const num = Number(parameters[0]?.value)
            return isNaN(num) ? Tiny.NULL : { kind: Tiny.ObjectKind.NUMBER, value: num }

        default:
            return Tiny.NULL
    }
}

const toBoolean: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 1) return Tiny.invalidArgument(position, evaluator.option)

    switch (parameters[0]?.kind) {
        case Tiny.ObjectKind.BOOLEAN:
            return {
                kind: Tiny.ObjectKind.BOOLEAN,
                value: parameters[0].value,
            }

        case Tiny.ObjectKind.NUMBER:
            return {
                kind: Tiny.ObjectKind.BOOLEAN,
                value: parameters[0].value !== 0,
            }

        case Tiny.ObjectKind.STRING:
            return {
                kind: Tiny.ObjectKind.BOOLEAN,
                value: parameters[0].value !== '',
            }

        default:
            return Tiny.NULL
    }
}

const toArray: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (parameters.length !== 1) return Tiny.invalidArgument(position, evaluator.option)

    switch (parameters[0]?.kind) {
        case Tiny.ObjectKind.ARRAY:
            return parameters[0]

        case Tiny.ObjectKind.OBJECT:
            return {
                kind: Tiny.ObjectKind.ARRAY,
                value: [...(parameters[0] as Tiny.ObjectObject).pairs.values()],
            }

        case Tiny.ObjectKind.STRING:
            return {
                kind: Tiny.ObjectKind.ARRAY,
                value: parameters[0].value.split('').map((v) => ({
                    kind: Tiny.ObjectKind.STRING,
                    value: v,
                })),
            }

        default:
            return Tiny.NULL
    }
}

const options: Tiny.Func = (parameters: Array<Tiny.LangObject>, enviroment: Tiny.Enviroment, evaluator: Tiny.Evaluator): Tiny.LangObject => {
    return {
        kind: Tiny.ObjectKind.OBJECT,
        pairs: new Map(
            Object.entries(evaluator.option).map(([key, value]) => [
                {
                    kind: Tiny.ObjectKind.STRING,
                    value: key,
                },
                typeof value === 'string'
                    ? {
                          kind: Tiny.ObjectKind.STRING,
                          value: value,
                      }
                    : {
                          kind: Tiny.ObjectKind.BOOLEAN,
                          value: value,
                      },
            ])
        ),
    }
}

const setOption: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING ||
        (parameters[1]?.kind !== Tiny.ObjectKind.STRING && parameters[1]?.kind !== Tiny.ObjectKind.BOOLEAN)
    )
        return Tiny.invalidArgument(position, evaluator.option)

    type T = { [key: string]: string | boolean }

    const key = parameters[0].value

    if ((evaluator.option as unknown as T)[key] && key !== 'allowEval' && key !== 'allowJavaScript')
        (evaluator.option as unknown as T)[key] = parameters[1].value
    else {
        return {
            kind: Tiny.ObjectKind.BOOLEAN,
            value: false,
        }
    }

    return {
        kind: Tiny.ObjectKind.BOOLEAN,
        value: true,
    }
}

const rootDir: Tiny.Func = (parameters: Array<Tiny.LangObject>, enviroment: Tiny.Enviroment, evaluator: Tiny.Evaluator): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.STRING,
    value: evaluator.option.root,
})

const curr: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.OBJECT,
    pairs: new Map([
        [
            { kind: Tiny.ObjectKind.STRING, value: 'line' },
            { kind: Tiny.ObjectKind.NUMBER, value: position.line },
        ],
        [
            { kind: Tiny.ObjectKind.STRING, value: 'column' },
            { kind: Tiny.ObjectKind.NUMBER, value: position.column },
        ],
    ]),
})

const filename: Tiny.Func = (parameters: Array<Tiny.LangObject>, enviroment: Tiny.Enviroment, evaluator: Tiny.Evaluator): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.STRING,
    value: evaluator.option.filename,
})

export const builtin: Map<string, Tiny.Func> = new Map([
    ['import', importEnviroment],
    ['eval', evalCode],
    ['js', evalJSCode],
    ['to_s', toString],
    ['to_n', toNumber],
    ['to_b', toBoolean],
    ['to_a', toArray],
    ['options', options],
    ['setOption', setOption],
    ['__builtin_length', length],
    ['__builtin_split', split],
    ['__root', rootDir],
    ['__pos', curr],
    ['__filename', filename],
])

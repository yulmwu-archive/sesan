import * as Sesan from '../../index'

const importEnviroment: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Sesan.ObjectKind.STRING) return Sesan.invalidArgument(position, evaluator.option)

    return evaluator.importEnv((parameters[0] as Sesan.StringObject).value, enviroment, evaluator, position)
}

const length: Sesan.Func = (parameters: Array<Sesan.LangObject>): Sesan.LangObject => {
    if (
        parameters.length !== 1 ||
        (parameters[0]?.kind !== Sesan.ObjectKind.ARRAY &&
            parameters[0]?.kind !== Sesan.ObjectKind.OBJECT &&
            parameters[0]?.kind !== Sesan.ObjectKind.STRING)
    )
        return Sesan.NULL

    if (parameters[0]?.kind === Sesan.ObjectKind.ARRAY)
        return {
            kind: Sesan.ObjectKind.NUMBER,
            value: (parameters[0] as Sesan.ArrayObject).value.length,
        }

    if (parameters[0]?.kind === Sesan.ObjectKind.STRING)
        return {
            kind: Sesan.ObjectKind.NUMBER,
            value: (parameters[0] as Sesan.StringObject).value.length,
        }

    return {
        kind: Sesan.ObjectKind.NUMBER,
        value: (parameters[0] as Sesan.ObjectObject).pairs.size,
    }
}

const evalCode: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Sesan.ObjectKind.STRING) return Sesan.invalidArgument(position, evaluator.option)

    if (!evaluator.option.allowEval)
        return {
            kind: Sesan.ObjectKind.ERROR,
            message: Sesan.localization(evaluator.option).builtinError.disableAllowEval,
            ...position,
        }

    return new Sesan.Evaluator(
        new Sesan.Parser(
            new Sesan.Lexer(
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

const evalJSCode: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Sesan.ObjectKind.STRING) return Sesan.invalidArgument(position, evaluator.option)

    if (!evaluator.option.allowJavaScript)
        return {
            kind: Sesan.ObjectKind.ERROR,
            message: evaluator.messages.builtinError.disableAllowJavaScript,
            ...position,
        }

    try {
        return eval(parameters[0].value)
    } catch (e) {
        if (e instanceof Error)
            return {
                kind: Sesan.ObjectKind.ERROR,
                message: Sesan.errorFormatter(evaluator.messages.builtinError.couldNotEval, e.message),
                ...position,
            }

        return {
            kind: Sesan.ObjectKind.ERROR,
            message: Sesan.errorFormatter(evaluator.messages.builtinError.couldNotEval, `${e}`),
            ...position,
        }
    }
}

const toString: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1) return Sesan.invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.STRING,
        value: Sesan.objectStringify(parameters[0]),
    }
}

const toNumber: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1) return Sesan.invalidArgument(position, evaluator.option)

    switch (parameters[0]?.kind) {
        case Sesan.ObjectKind.NUMBER:
            return parameters[0]

        case Sesan.ObjectKind.BOOLEAN:
            return {
                kind: Sesan.ObjectKind.NUMBER,
                value: parameters[0].value ? 1 : 0,
            }

        case Sesan.ObjectKind.STRING:
            const num = Number(parameters[0]?.value)
            return isNaN(num) ? Sesan.NULL : { kind: Sesan.ObjectKind.NUMBER, value: num }

        default:
            return Sesan.NULL
    }
}

const toBoolean: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1) return Sesan.invalidArgument(position, evaluator.option)

    switch (parameters[0]?.kind) {
        case Sesan.ObjectKind.BOOLEAN:
            return {
                kind: Sesan.ObjectKind.BOOLEAN,
                value: parameters[0].value,
            }

        case Sesan.ObjectKind.NUMBER:
            return {
                kind: Sesan.ObjectKind.BOOLEAN,
                value: parameters[0].value !== 0,
            }

        case Sesan.ObjectKind.STRING:
            return {
                kind: Sesan.ObjectKind.BOOLEAN,
                value: parameters[0].value !== '',
            }

        default:
            return Sesan.NULL
    }
}

const toArray: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1) return Sesan.invalidArgument(position, evaluator.option)

    switch (parameters[0]?.kind) {
        case Sesan.ObjectKind.ARRAY:
            return parameters[0]

        case Sesan.ObjectKind.OBJECT:
            return {
                kind: Sesan.ObjectKind.ARRAY,
                value: [...(parameters[0] as Sesan.ObjectObject).pairs.values()],
            }

        case Sesan.ObjectKind.STRING:
            return {
                kind: Sesan.ObjectKind.ARRAY,
                value: parameters[0].value.split('').map((v) => ({
                    kind: Sesan.ObjectKind.STRING,
                    value: v,
                })),
            }

        default:
            return Sesan.NULL
    }
}

const options: Sesan.Func = (parameters: Array<Sesan.LangObject>, enviroment: Sesan.Enviroment, evaluator: Sesan.Evaluator): Sesan.LangObject => {
    return {
        kind: Sesan.ObjectKind.OBJECT,
        pairs: new Map(
            Object.entries(evaluator.option).map(([key, value]) => [
                {
                    kind: Sesan.ObjectKind.STRING,
                    value: key,
                },
                typeof value === 'string'
                    ? {
                          kind: Sesan.ObjectKind.STRING,
                          value: value,
                      }
                    : {
                          kind: Sesan.ObjectKind.BOOLEAN,
                          value: value,
                      },
            ])
        ),
    }
}

const rootDir: Sesan.Func = (parameters: Array<Sesan.LangObject>, enviroment: Sesan.Enviroment, evaluator: Sesan.Evaluator): Sesan.LangObject => ({
    kind: Sesan.ObjectKind.STRING,
    value: evaluator.option.root,
})

const curr: Sesan.Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => ({
    kind: Sesan.ObjectKind.OBJECT,
    pairs: new Map([
        [
            { kind: Sesan.ObjectKind.STRING, value: 'line' },
            { kind: Sesan.ObjectKind.NUMBER, value: position.line },
        ],
        [
            { kind: Sesan.ObjectKind.STRING, value: 'column' },
            { kind: Sesan.ObjectKind.NUMBER, value: position.column },
        ],
    ]),
})

const filename: Sesan.Func = (parameters: Array<Sesan.LangObject>, enviroment: Sesan.Enviroment, evaluator: Sesan.Evaluator): Sesan.LangObject => ({
    kind: Sesan.ObjectKind.STRING,
    value: evaluator.option.filename,
})

const enviromentLength: Sesan.Func = (parameters: Array<Sesan.LangObject>, enviroment: Sesan.Enviroment): Sesan.LangObject => ({
    kind: Sesan.ObjectKind.NUMBER,
    value: enviroment.store.size,
})

export const builtin: Map<string, Sesan.Func> = new Map([
    ['import', importEnviroment],
    ['eval', evalCode],
    ['js', evalJSCode],
    ['to_s', toString],
    ['to_n', toNumber],
    ['to_b', toBoolean],
    ['to_a', toArray],
    ['options', options],
    ['__builtin_length', length],
    ['__root', rootDir],
    ['__pos', curr],
    ['__filename', filename],
    ['__env_store_length', enviromentLength],
])

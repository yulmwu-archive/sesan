import { Func, invalidArgument } from '.'
import * as Sesan from '../../index'

const push: Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 2 || parameters[0]?.kind !== Sesan.ObjectKind.ARRAY) return invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.ARRAY,
        value: [...(parameters[0] as Sesan.ArrayObject).value, parameters[1]],
    }
}

const pop: Func = (
    parameters: Array<Sesan.LangObject>,
    enviromnet: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Sesan.ObjectKind.ARRAY) return invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.ARRAY,
        value: [...(parameters[0] as Sesan.ArrayObject).value.slice(0, -1)],
    }
}

const shift: Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 1 || parameters[0]?.kind !== Sesan.ObjectKind.ARRAY) return invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.ARRAY,
        value: [...(parameters[0] as Sesan.ArrayObject).value.slice(1)],
    }
}

const unshift: Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (parameters.length !== 2 || parameters[0]?.kind !== Sesan.ObjectKind.ARRAY) return invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.ARRAY,
        value: [parameters[1], ...(parameters[0] as Sesan.ArrayObject).value],
    }
}

const slice: Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (
        parameters.length !== 3 ||
        parameters[0]?.kind !== Sesan.ObjectKind.ARRAY ||
        parameters[1]?.kind !== Sesan.ObjectKind.NUMBER ||
        parameters[2]?.kind !== Sesan.ObjectKind.NUMBER
    )
        return invalidArgument(position, evaluator.option)

    return {
        kind: Sesan.ObjectKind.ARRAY,
        value: (parameters[0] as Sesan.ArrayObject).value.slice(parameters[1].value, parameters[2].value),
    }
}

const join: Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (
        (parameters.length !== 1 && parameters.length !== 2) ||
        parameters[0]?.kind !== Sesan.ObjectKind.ARRAY ||
        parameters[1]?.kind !== Sesan.ObjectKind.STRING
    )
        return invalidArgument(position, evaluator.option)

    if (parameters.length === 1)
        return {
            kind: Sesan.ObjectKind.STRING,
            value: (parameters[0] as Sesan.ArrayObject).value.map((v) => Sesan.objectStringify(v)).join(parameters[1].value),
        }

    return {
        kind: Sesan.ObjectKind.STRING,
        value: (parameters[0] as Sesan.ArrayObject).value.map((v) => Sesan.objectStringify(v)).join(''),
    }
}

const forEach: Func = (
    parameters: Array<Sesan.LangObject>,
    enviroment: Sesan.Enviroment,
    evaluator: Sesan.Evaluator,
    position: Sesan.Position
): Sesan.LangObject => {
    if (
        parameters.length !== 2 ||
        (parameters[0]?.kind !== Sesan.ObjectKind.ARRAY && parameters[0]?.kind !== Sesan.ObjectKind.BOOLEAN) ||
        parameters[1]?.kind !== Sesan.ObjectKind.FUNCTION
    )
        return invalidArgument(position, evaluator.option)

    const func = parameters[1] as Sesan.FunctionObject

    if (parameters[0].kind === Sesan.ObjectKind.ARRAY) {
        const array = parameters[0] as Sesan.ArrayObject

        for (const [index, value] of array.value.entries()) {
            const result = evaluator.applyFunction(
                func,
                '',
                [
                    value,
                    {
                        kind: Sesan.ObjectKind.NUMBER,
                        value: index,
                    },
                ],
                enviroment,
                position,
                Sesan.NULL
            )

            if (result?.kind === Sesan.ObjectKind.BOOLEAN && !result.value) break
        }
    } else {
        for (let i = 0; true; i++) {
            const result = evaluator.applyFunction(
                func,
                '',
                [
                    {
                        kind: Sesan.ObjectKind.NUMBER,
                        value: i,
                    },
                ],
                enviroment,
                position,
                Sesan.NULL
            )

            if (result?.kind === Sesan.ObjectKind.BOOLEAN && !result.value) break
        }
    }

    return Sesan.NULL
}

export const array: Map<string, Func> = new Map([
    ['__builtin_push', push],
    ['__builtin_pop', pop],
    ['__builtin_shift', shift],
    ['__builtin_unshift', unshift],
    ['__builtin_slice', slice],
    ['__builtin_join', join],
    ['__builtin_forEach', forEach],
])

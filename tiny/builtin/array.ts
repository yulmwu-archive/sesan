import { Func, invalidArgument } from '.';
import * as Tiny from '../../index';

const push: Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[0]?.kind !== Tiny.ObjectKind.ARRAY
    )
        return invalidArgument(position, evaluator.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [...(parameters[0] as Tiny.ArrayObject).value, parameters[1]],
    };
};

const pop: Func = (
    parameters: Array<Tiny.LangObject>,
    enviromnet: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 1 ||
        parameters[0]?.kind !== Tiny.ObjectKind.ARRAY
    )
        return invalidArgument(position, evaluator.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [...(parameters[0] as Tiny.ArrayObject).value.slice(0, -1)],
    };
};

const shift: Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 1 ||
        parameters[0]?.kind !== Tiny.ObjectKind.ARRAY
    )
        return invalidArgument(position, evaluator.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [...(parameters[0] as Tiny.ArrayObject).value.slice(1)],
    };
};

const unshift: Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[0]?.kind !== Tiny.ObjectKind.ARRAY
    )
        return invalidArgument(position, evaluator.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: [parameters[1], ...(parameters[0] as Tiny.ArrayObject).value],
    };
};

const slice: Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 3 ||
        parameters[0]?.kind !== Tiny.ObjectKind.ARRAY ||
        parameters[1]?.kind !== Tiny.ObjectKind.NUMBER ||
        parameters[2]?.kind !== Tiny.ObjectKind.NUMBER
    )
        return invalidArgument(position, evaluator.option);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: (parameters[0] as Tiny.ArrayObject).value.slice(
            parameters[1].value,
            parameters[2].value
        ),
    };
};

const join: Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[0]?.kind !== Tiny.ObjectKind.ARRAY ||
        parameters[1]?.kind !== Tiny.ObjectKind.STRING
    )
        return invalidArgument(position, evaluator.option);

    return {
        kind: Tiny.ObjectKind.STRING,
        value: (parameters[0] as Tiny.ArrayObject).value
            .map((v) => Tiny.objectStringify(v))
            .join(parameters[1].value),
    };
};

const forEach: Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        (parameters[0]?.kind !== Tiny.ObjectKind.ARRAY &&
            parameters[0]?.kind !== Tiny.ObjectKind.BOOLEAN) ||
        parameters[1]?.kind !== Tiny.ObjectKind.FUNCTION
    )
        return invalidArgument(position, evaluator.option);

    const func = parameters[1] as Tiny.FunctionObject;

    if (parameters[0].kind === Tiny.ObjectKind.ARRAY) {
        const array = parameters[0] as Tiny.ArrayObject;

        for (const [index, value] of array.value.entries()) {
            const result = evaluator.applyFunction(
                func,
                '',
                [
                    value,
                    {
                        kind: Tiny.ObjectKind.NUMBER,
                        value: index,
                    },
                ],
                enviroment,
                position,
                Tiny.NULL
            );

            if (result?.kind === Tiny.ObjectKind.BOOLEAN && !result.value)
                break;
        }
    } else {
        for (let i = 0; true; i++) {
            const result = evaluator.applyFunction(
                func,
                '',
                [
                    {
                        kind: Tiny.ObjectKind.NUMBER,
                        value: i,
                    },
                ],
                enviroment,
                position,
                Tiny.NULL
            );

            if (result?.kind === Tiny.ObjectKind.BOOLEAN && !result.value)
                break;
        }
    }

    return Tiny.NULL;
};

export const array: Map<string, Func> = new Map([
    ['__builtin_push', push],
    ['__builtin_pop', pop],
    ['__builtin_shift', shift],
    ['__builtin_unshift', unshift],
    ['__builtin_slice', slice],
    ['__builtin_join', join],
    ['__builtin_forEach', forEach],
]);

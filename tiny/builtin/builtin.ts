import * as Tiny from '../../index';

const importEnviroment: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 1 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(position, evaluator.options);

    return evaluator.importEnv(
        (parameters[0] as Tiny.StringObject).value,
        enviroment,
        evaluator,
        position
    );
};

const length: Tiny.Func = (
    parameters: Array<Tiny.LangObject>
): Tiny.LangObject => {
    if (
        parameters.length !== 1 ||
        (parameters[0]?.kind !== Tiny.ObjectKind.ARRAY &&
            parameters[0]?.kind !== Tiny.ObjectKind.OBJECT &&
            parameters[0]?.kind !== Tiny.ObjectKind.STRING)
    )
        return Tiny.NULL;

    if (parameters[0]?.kind === Tiny.ObjectKind.ARRAY)
        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: (parameters[0] as Tiny.ArrayObject).value.length,
        };

    if (parameters[0]?.kind === Tiny.ObjectKind.STRING)
        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: (parameters[0] as Tiny.StringObject).value.length,
        };

    return {
        kind: Tiny.ObjectKind.NUMBER,
        value: (parameters[0] as Tiny.ObjectObject).pairs.size,
    };
};

const split: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(position, evaluator.options);

    return {
        kind: Tiny.ObjectKind.ARRAY,
        value: (parameters[0] as Tiny.StringObject).value
            .split((parameters[1] as Tiny.StringObject).value)
            .map((s) => ({
                kind: Tiny.ObjectKind.STRING,
                value: s,
            })),
    };
};

const evalCode: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 1 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(position, evaluator.options);

    if (!evaluator.options.allowEval)
        return {
            kind: Tiny.ObjectKind.ERROR,
            message: Tiny.localization(evaluator.options).builtinError
                .disableAllowEval,
            ...position,
        };

    return new Tiny.Evaluator(
        new Tiny.Parser(
            new Tiny.Lexer(
                parameters[0].value,
                {
                    ...evaluator.options,
                    stderr: evaluator.stdio.stderr,
                },
                evaluator.filename
            ),
            evaluator.options
        ).parseProgram(),
        enviroment,
        evaluator.options,
        evaluator.stdio,
        evaluator.filename
    ).eval();
};

const evalJSCode: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 1 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(position, evaluator.options);

    if (!evaluator.options.allowJavaScript)
        return {
            kind: Tiny.ObjectKind.ERROR,
            message: evaluator.messages.builtinError.disableAllowJavaScript,
            ...position,
        };

    try {
        return eval(parameters[0].value);
    } catch (e) {
        if (e instanceof Error)
            return {
                kind: Tiny.ObjectKind.ERROR,
                message: Tiny.errorFormatter(
                    evaluator.messages.builtinError.couldNotEval,
                    e.message
                ),
                ...position,
            };

        return {
            kind: Tiny.ObjectKind.ERROR,
            message: Tiny.errorFormatter(
                evaluator.messages.builtinError.couldNotEval,
                `${e}`
            ),
            ...position,
        };
    }
};

const convert: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[1]?.kind !== Tiny.ObjectKind.STRING
    )
        return Tiny.invalidArgument(position, evaluator.options);

    const to = parameters[1].value.toLowerCase();

    if (to === 'number') {
        switch (parameters[0]?.kind) {
            case Tiny.ObjectKind.NUMBER:
                return parameters[0];

            case Tiny.ObjectKind.BOOLEAN:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: parameters[0].value ? 1 : 0,
                };

            case Tiny.ObjectKind.STRING:
                const num = Number(parameters[0]?.value);
                return isNaN(num)
                    ? Tiny.NULL
                    : { kind: Tiny.ObjectKind.NUMBER, value: num };

            default:
                return Tiny.NULL;
        }
    } else if (to === 'string')
        return {
            kind: Tiny.ObjectKind.STRING,
            value: Tiny.objectStringify(parameters[0]),
        };
    else if (to === 'boolean') {
        switch (parameters[0]?.kind) {
            case Tiny.ObjectKind.BOOLEAN:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: parameters[0].value,
                };

            case Tiny.ObjectKind.NUMBER:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: parameters[0].value !== 0,
                };

            case Tiny.ObjectKind.STRING:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: parameters[0].value !== '',
                };

            default:
                return Tiny.NULL;
        }
    }

    return { kind: Tiny.ObjectKind.NULL };
};

const options: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator
): Tiny.LangObject => {
    return {
        kind: Tiny.ObjectKind.OBJECT,
        pairs: new Map(
            Object.entries(evaluator.options).map(([key, value]) => [
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
    };
};

const setOption: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
): Tiny.LangObject => {
    if (
        parameters.length !== 2 ||
        parameters[0]?.kind !== Tiny.ObjectKind.STRING ||
        (parameters[1]?.kind !== Tiny.ObjectKind.STRING &&
            parameters[1]?.kind !== Tiny.ObjectKind.BOOLEAN)
    )
        return Tiny.invalidArgument(position, evaluator.options);

    type T = { [key: string]: string | boolean };

    const key = parameters[0].value;

    if (
        (evaluator.options as T)[key] &&
        key !== 'allowEval' &&
        key !== 'allowJavaScript'
    )
        (evaluator.options as T)[key] = parameters[1].value;
    else {
        return {
            kind: Tiny.ObjectKind.BOOLEAN,
            value: false,
        };
    }

    return {
        kind: Tiny.ObjectKind.BOOLEAN,
        value: true,
    };
};

const rootDir: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.STRING,
    value: evaluator.root,
});

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
});

const filename: Tiny.Func = (
    parameters: Array<Tiny.LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.STRING,
    value: evaluator.filename,
});

export const builtin: Map<string, Tiny.Func> = new Map([
    ['import', importEnviroment],
    ['eval', evalCode],
    ['js', evalJSCode],
    ['convert', convert],
    ['options', options],
    ['setOption', setOption],
    ['__builtin_length', length],
    ['__builtin_split', split],
    ['__root', rootDir],
    ['__pos', curr],
    ['__filename', filename],
]);

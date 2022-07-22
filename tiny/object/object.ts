import {
    Enviroment,
    Evaluator,
    Options,
    Expression,
    Position,
} from '../../index';

type LangObject =
    | NumberObject
    | StringObject
    | BooleanObject
    | ArrayObject
    | HashObject
    | FunctionObject
    | BuiltinFunction
    | ReturnValue
    | ErrorObject
    | Null
    | null;

const enum ObjectKind {
    NUMBER = 300,
    STRING,
    BOOLEAN,
    ARRAY,
    HASH,
    FUNCTION,
    BUILTIN,
    RETURN_VALUE,
    ERROR,
    NULL,
}

const objectStringify = (
    obj: LangObject,
    strW: boolean = false,
    strO: boolean = false
): string => {
    if (!obj) return 'NULL';

    const quote = (str: string, w: boolean): string => (w ? `"${str}"` : str);

    switch (obj.kind) {
        case ObjectKind.NUMBER:
            return obj.value.toString();

        case ObjectKind.STRING:
            return quote(obj.value, strW);

        case ObjectKind.BOOLEAN:
            return obj.value ? 'true' : 'false';

        case ObjectKind.ARRAY:
            return `[${obj.value
                .map((v) => objectStringify(v, true))
                .join(', ')}]`;

        case ObjectKind.HASH:
            return JSON.stringify(
                JSON.parse(
                    `{ ${[...obj.pairs.entries()]
                        .map(
                            ([key, value]) =>
                                `${objectStringify(
                                    key,
                                    true,
                                    true
                                )}: ${objectStringify(value, true, true)}`
                        )
                        .join(', ')} }`
                ),
                null,
                2
            );

        case ObjectKind.FUNCTION:
            return quote(
                `func([${obj.parameters.map((m) => m?.kind).join(', ')}])`,
                strO
            );

        case ObjectKind.BUILTIN:
            return quote(`builtin`, strO);

        case ObjectKind.NULL:
            return quote('NULL', strO);

        case ObjectKind.ERROR:
            return quote(`Error: ${obj.message}`, strO);

        default:
            return `[Unknown]`;
    }
};

const objectKindStringify = (kind: ObjectKind): string => {
    switch (kind) {
        case ObjectKind.NUMBER:
            return 'NUMBER';

        case ObjectKind.STRING:
            return 'STRING';

        case ObjectKind.BOOLEAN:
            return 'BOOLEAN';

        case ObjectKind.ARRAY:
            return 'ARRAY';

        case ObjectKind.HASH:
            return 'HASH';

        case ObjectKind.FUNCTION:
            return 'FUNCTION';

        case ObjectKind.BUILTIN:
            return 'BUILTIN';

        case ObjectKind.RETURN_VALUE:
            return 'RETURN_VALUE';

        case ObjectKind.ERROR:
            return 'ERROR';

        case ObjectKind.NULL:
            return 'NULL';

        default:
            return 'UNKNOWN';
    }
};

interface NumberObject {
    value: number;
    kind: ObjectKind.NUMBER;
}

interface BooleanObject {
    value: boolean;
    kind: ObjectKind.BOOLEAN;
}

interface StringObject {
    value: string;
    kind: ObjectKind.STRING;
}

interface ArrayObject {
    value: Array<LangObject>;
    kind: ObjectKind.ARRAY;
}

interface HashObject {
    pairs: Map<NumberObject | StringObject, LangObject>;
    kind: ObjectKind.HASH;
}

interface FunctionObject {
    function: Expression;
    parameters: Array<Expression>;
    d: boolean;
    body: Expression;
    env: Enviroment;
    option: Options;
    kind: ObjectKind.FUNCTION | ObjectKind.BUILTIN;
}

interface BuiltinFunction {
    func: (
        args: Array<LangObject>,
        env: Enviroment,
        t: Evaluator,
        pos: Position
    ) => LangObject;
    kind: ObjectKind.BUILTIN;
}

interface ReturnValue {
    value: LangObject;
    kind: ObjectKind.RETURN_VALUE;
}

interface ErrorObject {
    message: string;
    kind: ObjectKind.ERROR;
    line: number;
    column: number;
}

interface Null {
    kind: ObjectKind.NULL;
}

export {
    LangObject,
    NumberObject,
    BooleanObject,
    StringObject,
    ArrayObject,
    HashObject,
    FunctionObject,
    BuiltinFunction,
    ReturnValue,
    ErrorObject,
    Null,
    ObjectKind,
    objectStringify,
    objectKindStringify,
};

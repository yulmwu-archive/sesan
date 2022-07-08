import { Enviroment } from '.';
import { Evaluator } from '../evaluator';
import { Options } from '../options';
import { Expression } from '../parser';

type LangObject =
    | NumberObject
    | StringObject
    | BooleanObject
    | ArrayObject
    | HashObject
    | FunctionObject
    | BuiltinFunction
    | QuoteObject
    | ReturnValue
    | ErrorObject
    | Null
    | null;

enum ObjectKind {
    NUMBER = 300,
    STRING,
    BOOLEAN,
    ARRAY,
    HASH,
    FUNCTION,
    BUILTIN,
    QUOTE,
    RETURN_VALUE,
    ERROR,
    NULL,
}

const objectStringify = (obj: LangObject, strW: boolean = false): string => {
    if (!obj) return 'NULL';

    switch (obj.kind) {
        case ObjectKind.NUMBER:
            return obj.value.toString();

        case ObjectKind.STRING:
            return strW ? `"${obj.value}"` : obj.value;

        case ObjectKind.BOOLEAN:
            return obj.value ? 'true' : 'false';

        case ObjectKind.ARRAY:
            return `[${obj.value
                .map((v) => objectStringify(v, true))
                .join(', ')}]`;

        case ObjectKind.HASH:
            return `{ ${[...obj.pairs.entries()]
                .map(
                    ([key, value]) =>
                        `${objectStringify(key)}: ${objectStringify(
                            value,
                            true
                        )}`
                )
                .join(', ')} }`;

        case ObjectKind.FUNCTION:
            return `func([${obj.parameters.map((m) => m?.kind).join(', ')}])`;

        case ObjectKind.BUILTIN:
            return `builtin`;

        case ObjectKind.NULL:
            return 'NULL';

        case ObjectKind.ERROR:
            return `Error: ${obj.message}`;

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

        case ObjectKind.QUOTE:
            return 'QUOTE';

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
    parameters: Array<Expression>;
    body: Expression;
    env: Enviroment;
    option: Options;
    kind: ObjectKind.FUNCTION | ObjectKind.BUILTIN;
}

interface BuiltinFunction {
    func: (
        args: Array<LangObject>,
        env: Enviroment,
        option: Options,
        t: Evaluator
    ) => LangObject;
    kind: ObjectKind.BUILTIN;
}

interface QuoteObject {
    value: Expression;
    kind: ObjectKind.QUOTE;
}

interface ReturnValue {
    value: LangObject;
    kind: ObjectKind.RETURN_VALUE;
}

interface ErrorObject {
    message: string;
    kind: ObjectKind.ERROR;
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
    QuoteObject,
    ReturnValue,
    ErrorObject,
    Null,
    ObjectKind,
    objectStringify,
    objectKindStringify,
};

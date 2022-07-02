import { Enviroment } from '.';
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
    | null;

enum ObjectKind {
    NUMBER,
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
    pairs: Map<NumberObject | BooleanObject | StringObject, LangObject>;
    kind: ObjectKind.HASH;
}

interface FunctionObject {
    parameters: Array<Expression>;
    body: Expression;
    env: Enviroment;
    kind: ObjectKind.FUNCTION | ObjectKind.BUILTIN;
}

interface BuiltinFunction {
    func: (...args: Array<LangObject>) => LangObject;
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
    ObjectKind,
};

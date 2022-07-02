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
    | null;

interface NumberObject {
    value: number;
}

interface BooleanObject {
    value: boolean;
}

interface StringObject {
    value: string;
}

interface ArrayObject {
    value: Array<LangObject>;
}

interface HashObject {
    pairs: Map<NumberObject | BooleanObject | StringObject, LangObject>;
}

interface FunctionObject {
    parameters: Array<Expression>;
    body: Expression;
    env: Enviroment;
}

interface BuiltinFunction {
    (...args: Array<LangObject>): LangObject;
}

interface QuoteObject {
    value: Expression;
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
};

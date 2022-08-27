import * as Tiny from '../../index'

export type LangObject =
    | NumberObject
    | StringObject
    | BooleanObject
    | ArrayObject
    | ObjectObject
    | FunctionObject
    | BuiltinFunction
    | ReturnValue
    | ErrorObject
    | Null
    | Undefined
    | null

export const enum ObjectKind {
    NUMBER = 300,
    STRING,
    BOOLEAN,
    ARRAY,
    OBJECT,
    FUNCTION,
    BUILTIN,
    RETURN_VALUE,
    ERROR,
    NULL,
    UNDEFINED,
    DECORATOR,
}

export const objectStringify = (obj: LangObject, strW: boolean = false): string => {
    if (!obj) return 'null'

    switch (obj.kind) {
        case ObjectKind.NUMBER:
            return obj.value.toString()

        case ObjectKind.STRING:
            return strW ? `"${obj.value}"` : obj.value

        case ObjectKind.BOOLEAN:
            return obj.value ? 'true' : 'false'

        case ObjectKind.ARRAY:
            return `[${obj.value.map((v) => objectStringify(v, true)).join(', ')}]`

        case ObjectKind.OBJECT:
            return `{ ${[...obj.pairs.entries()]
                .map(([key, value]) => `${objectStringify(key, true)}: ${objectStringify(value, true)}`)
                .join(', ')} }`

        case ObjectKind.FUNCTION:
            return `func([${obj.parameters.map((m) => m?.kind).join(', ')}])`

        case ObjectKind.BUILTIN:
            return 'builtin'

        case ObjectKind.NULL:
            return 'null'

        case ObjectKind.UNDEFINED:
            return 'undefined'

        case ObjectKind.ERROR:
            return `error: ${obj.message}`

        default:
            return `[Unknown]`
    }
}

export const objectKindStringify = (kind: ObjectKind): string => {
    switch (kind) {
        case ObjectKind.NUMBER:
            return 'number'

        case ObjectKind.STRING:
            return 'string'

        case ObjectKind.BOOLEAN:
            return 'boolean'

        case ObjectKind.ARRAY:
            return 'array'

        case ObjectKind.OBJECT:
            return 'object'

        case ObjectKind.FUNCTION:
            return 'function'

        case ObjectKind.BUILTIN:
            return 'builtin'

        case ObjectKind.ERROR:
            return 'error'

        case ObjectKind.NULL:
            return 'null'

        case ObjectKind.UNDEFINED:
            return 'undefined'

        default:
            return 'unknown'
    }
}

export interface NumberObject {
    value: number
    kind: ObjectKind.NUMBER
}

export interface BooleanObject {
    value: boolean
    kind: ObjectKind.BOOLEAN
}

export interface StringObject {
    value: string
    kind: ObjectKind.STRING
}

export interface ArrayObject {
    value: Array<LangObject>
    kind: ObjectKind.ARRAY
}

export interface ObjectObject {
    pairs: Map<NumberObject | StringObject, LangObject>
    kind: ObjectKind.OBJECT
}

export interface FunctionObject {
    function: Tiny.Expression
    parameters: Array<Tiny.Expression>
    decorator?: ObjectObject
    body: Tiny.Expression
    enviroment: Tiny.Enviroment
    option: Tiny.Options
    kind: ObjectKind.FUNCTION
}

export interface BuiltinFunction {
    func: BuiltinFunctionType
    kind: ObjectKind.BUILTIN
}

export type BuiltinFunctionType = (
    parameters: Array<LangObject>,
    enviroment: Tiny.Enviroment,
    evaluator: Tiny.Evaluator,
    position: Tiny.Position
) => LangObject

export interface ReturnValue {
    value: LangObject
    kind: ObjectKind.RETURN_VALUE
}

export interface ErrorObject {
    message: string
    kind: ObjectKind.ERROR
    line: number
    column: number
}

export interface Null {
    kind: ObjectKind.NULL
}

export interface Undefined {
    kind: ObjectKind.UNDEFINED
}
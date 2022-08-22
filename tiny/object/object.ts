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
    if (!obj) return 'NULL'

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
            return 'NULL'

        case ObjectKind.UNDEFINED:
            return 'UNDEFINED'

        case ObjectKind.ERROR:
            return `ERROR: ${obj.message}`

        default:
            return `[Unknown]`
    }
}

export const objectKindStringify = (kind: ObjectKind): string => {
    switch (kind) {
        case ObjectKind.NUMBER:
            return 'NUMBER'

        case ObjectKind.STRING:
            return 'STRING'

        case ObjectKind.BOOLEAN:
            return 'BOOLEAN'

        case ObjectKind.ARRAY:
            return 'ARRAY'

        case ObjectKind.OBJECT:
            return 'OBJECT'

        case ObjectKind.FUNCTION:
            return 'FUNCTION'

        case ObjectKind.BUILTIN:
            return 'BUILTIN'

        case ObjectKind.RETURN_VALUE:
            return 'RETURN_VALUE'

        case ObjectKind.ERROR:
            return 'ERROR'

        case ObjectKind.NULL:
            return 'NULL'

        case ObjectKind.UNDEFINED:
            return 'UNDEFINED'

        default:
            return 'UNKNOWN'
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
    func: (parameters: Array<LangObject>, enviroment: Tiny.Enviroment, evaluator: Tiny.Evaluator, position: Tiny.Position) => LangObject
    kind: ObjectKind.BUILTIN
}

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

import * as Sesan from '../../index'
import { io } from './io'
import { array } from './array'
import { builtin } from './builtin'
import { strings } from './string'

type Func = Sesan.BuiltinFunctionType

const invalidArgument = (position: Sesan.Position, options: Sesan.Options): Sesan.LangObject => ({
    kind: Sesan.ObjectKind.ERROR,
    message: Sesan.localization(options).builtinError.invalidArgument,
    ...position,
})

const builtinsEval: Map<string, Func> = new Map()

const builtinFunction = (name: string): Sesan.LangObject | null => {
    const func: Func | undefined = new Map([...builtinsEval, ...builtin, ...array, ...io, ...strings]).get(name)

    if (!func) return null

    return {
        kind: Sesan.ObjectKind.BUILTIN,
        func,
    }
}

export { Func, invalidArgument, builtinsEval, builtinFunction }

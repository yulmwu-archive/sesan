import * as Sesan from '../../index'

const print: Sesan.Func = (parameters: Array<Sesan.LangObject>, enviroment: Sesan.Enviroment, evaluator: Sesan.Evaluator): Sesan.LangObject => {
    if (parameters[0]?.kind !== Sesan.ObjectKind.ARRAY) return Sesan.NULL

    evaluator.option.stdio.stdout(`${parameters[0]?.value.map((arg) => Sesan.objectStringify(arg)).join(' ')}${Sesan.objectStringify(parameters[1])}`)

    return Sesan.NULL
}

export const io: Map<string, Sesan.Func> = new Map([['__builtin_print', print]])

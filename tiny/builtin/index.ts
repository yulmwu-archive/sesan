import * as Tiny from '../../index';
import { io } from './io';
import { array } from './array';
import { builtin } from './builtin';

type Func = Tiny.BuiltinFunction['func'];

const invalidArgument = (
    pos: Tiny.Position,
    option: Tiny.Options
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.ERROR,
    message: Tiny.localization(option).builtinError.invalidArgument,
    ...pos,
});

const builtinsEval: Map<string, Func> = new Map();

const builtinFunction = (
    name: string,
    env: Tiny.Enviroment
): Tiny.LangObject | null => {
    const func: Func | undefined = new Map([
        ...builtinsEval,
        ...builtin,
        ...array,
        ...io,
    ]).get(name);

    if (!func) return null;

    return {
        kind: Tiny.ObjectKind.BUILTIN,
        func,
    };
};

export { Func, invalidArgument, builtinsEval, builtinFunction };

import * as Tiny from '../../index';
import { io } from './io';
import { array } from './array';
import { builtin } from './builtin';
import { strings } from './string';

type Func = Tiny.BuiltinFunction['func'];

const invalidArgument = (
    position: Tiny.Position,
    options: Tiny.Options
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.ERROR,
    message: Tiny.localization(options).builtinError.invalidArgument,
    ...position,
});

const builtinsEval: Map<string, Func> = new Map();

const builtinFunction = (name: string): Tiny.LangObject | null => {
    const func: Func | undefined = new Map([
        ...builtinsEval,
        ...builtin,
        ...array,
        ...io,
        ...strings,
    ]).get(name);

    if (!func) return null;

    return {
        kind: Tiny.ObjectKind.BUILTIN,
        func,
    };
};

export { Func, invalidArgument, builtinsEval, builtinFunction };

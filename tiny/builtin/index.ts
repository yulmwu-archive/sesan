import {
    BuiltinFunction,
    Enviroment,
    LangObject,
    ObjectKind,
    NULL,
    Position,
} from '../../index';
import { io } from './io';
import { array } from './array';
import { decorator } from './decorator';
import { builtin } from './builtin';

type Func = Omit<BuiltinFunction, 'kind'>['func'];

const invalidArgument = (pos: Position): LangObject => ({
    kind: ObjectKind.ERROR,
    message: 'Invalid arguments',
    ...pos,
});

const builtinsEval: Map<string, Func> = new Map();

const builtinFunction = (name: string, env: Enviroment): LangObject | null => {
    const func: Func | undefined = new Map([
        ...builtinsEval,
        ...builtin,
        ...array,
        ...io,
        ...decorator,
    ]).get(name);

    if (!func) return null;

    return {
        kind: ObjectKind.BUILTIN,
        func,
    };
};

export { Decorator } from './decorator';
export { Func, invalidArgument, builtinsEval, builtinFunction };

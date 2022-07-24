import { Func, invalidArgument } from '.';
import {
    Enviroment,
    Position,
    Evaluator,
    NULL,
    LangObject,
    ObjectKind,
    BooleanObject,
} from '../../index';

export interface Decorator {
    disableCheckArguments: boolean;
}

const decoratorFunc: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (args.length !== 1 || args[0]?.kind !== ObjectKind.HASH)
        return invalidArgument(pos, t.option);

    let data: Map<string | number, LangObject> = new Map();

    args[0].pairs.forEach((value, key) => data.set(key.value, value));

    const get = (key: string | number): boolean =>
        (data.get(key) as BooleanObject)?.value;

    t.__function__decorator = {
        disableCheckArguments: get('disableCheckArguments'),
    };

    return NULL;
};

export const decorator: Map<string, Func> = new Map([['@func', decoratorFunc]]);

import { Func, invalidArgument } from '.';
import { Enviroment, Options, Position } from '../../index';
import { Evaluator, NULL } from '../evaluator';
import { LangObject, ObjectKind } from '../object';

type Decorator = {
    disableCheckArguments: boolean;
} | null;

const decoratorFunc: Func = (
    args: Array<LangObject>,
    env: Enviroment,
    t: Evaluator,
    pos: Position
): LangObject => {
    if (!(args.length > 0) || args[0]?.kind !== ObjectKind.BOOLEAN)
        return invalidArgument(pos);

    t.__function__decorator = {
        disableCheckArguments: args[0].value,
    };

    return NULL;
};

export { Decorator, decoratorFunc };

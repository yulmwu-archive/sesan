import { LangObject, ObjectKind } from '../object';
import colors from 'colors';
import { Stdio } from '../index';

colors.enabled = true;

const error = (message: string): LangObject => ({
    kind: ObjectKind.ERROR,
    message,
});

const printError = (message: string, stdout: Stdio, color: boolean = false) => {
    if (color) stdout(`${`[Error]`.bgRed} ${message.red}`);
    else stdout(`[Error] ${message}`);
};

export default error;
export { printError };

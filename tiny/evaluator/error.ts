import { LangObject, ObjectKind } from '../object';
import { Stdio } from '../../index';
import { Options } from '../options';
import colors from 'colors';

colors.enabled = true;

const error = (message: string): LangObject => ({
    kind: ObjectKind.ERROR,
    message,
});

const printError = (message: string, stderr: Stdio, options: Options) =>
    stderr(
        `${
            options.stderrPrefix
                ? `${options.stderrColor ? `[Error]`.bgRed : `[Error]`} `
                : ''
        }${options.stderrColor ? message.red : message}`
    );

export default error;
export { printError };

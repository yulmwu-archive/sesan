import { LangObject, ObjectKind } from '../object';
import { ParseError, Stdio } from '../../index';
import { Options } from '../options';
import colors from 'colors';

colors.enabled = true;

const error = (message: string, line: number, column: number): LangObject => ({
    kind: ObjectKind.ERROR,
    message,
    line,
    column,
});

const printError = (error: ParseError, stderr: Stdio, options: Options) => {
    const { line, column, message } = error;

    stderr(
        `${
            options.stderrPrefix
                ? `${options.stderrColor ? `[Error]`.bgRed : `[Error]`} `
                : ''
        }${options.stderrColor ? message.red : message} (${
            options.stderrColor
                ? `${line.toString().yellow}:${column.toString().blue}`
                : `${line}:${column}`
        })`
    );
};

export default error;
export { printError };

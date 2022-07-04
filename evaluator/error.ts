import { LangObject, ObjectKind } from '../object';

const error = (message: string): LangObject => ({
    kind: ObjectKind.ERROR,
    message,
});

const printError = (message: string) =>
    console.error(`${`[Error]`.bgRed} ${message.red}`, '\n');

export default error;
export { printError };

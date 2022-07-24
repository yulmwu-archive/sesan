import {
    ParseError,
    Stdio,
    Options,
    LangObject,
    ObjectKind,
} from '../../index';
import colors from 'colors';

colors.enabled = true;

const errorsLocale: {
    [key: string]: any;
} = {
    en: {
        lexerError: {
            invalidIdentifier: 'Invalid identifier',
            invalidNumber: 'Invalid number',
            invalidString: 'Unterminated string: {0}',
        },
        parserError: {
            unexpectedToken:
                "Expected next token to be '{0}', got '{1}' instead.",
            unexpectedExpression: `Expected expression, got {0} instead.`,
        },
        runtimeError: {
            invalidArgument: "'{0}' expected {1} arguments but got {2}.",
            invalidFunction: "'{0}' is not a function.",
            identifierNotDefined_1: "'{0}' is not defined.",
            identifierNotDefined_2: "Identifier '{0}' is not defined.",
            typeMismatch_1: 'Type mismatch.',
            typeMismatch_2: 'Type mismatch: [{0}], [{1}].',
            indexOutOfRange: 'Index out of range.',
        },
        builtinError: {
            invalidArgument: 'Invalid argument.',
            disableAllowEval: "'allowEval' is not allowed",
            disableAllowJavaScript: "'allowJavaScript' is not allowed",
            couldNotEval: '`Could not evalulate JavaScript: {0}',
        },
    },
    ko: {
        lexerError: {
            invalidIdentifier: '유효하지 않은 식별자입니다.',
            invalidNumber: '유효하지 않은 숫자입니다.',
            invalidString: '종료되지 않은 문자열입니다: {0}',
        },
        parserError: {
            unexpectedToken:
                "'{0}' 을(를) 예상했지만, '{1}' 을(를) 받았습니다.",
            unexpectedExpression: `식을 예상했지만, {0}을(를) 받았습니다.`,
        },
        runtimeError: {
            invalidArgument:
                "'{0}' 에는 {1} 개의 인수가 필요하지만, {2} 개의 인수를 받았습니다.",
            invalidFunction: "'{0}' 은(는) 함수가 아닙니다.",
            identifierNotDefined_1: "'{0}' 이(가) 정의되지 않았습니다.",
            identifierNotDefined_2: "식별자 '{0}' 이(가) 정의되지 않았습니다.",
            typeMismatch_1: '유형이 일치하지 않습니다.',
            typeMismatch_2: '유형이 일치하지 않습니다: [{0}], [{1}].',
            indexOutOfRange: '인덱스가 범위를 벗어났습니다.',
        },
        builtinError: {
            invalidArgument: '유효하지 않은 인수입니다.',
            disableAllowEval: "'allowEval' 은(는) 허용되지 않습니다.",
            disableAllowJavaScript:
                "'allowJavaScript' 은(는) 허용되지 않습니다.",
            couldNotEval: '`자바스크립트를 실행하지 못했습니다: {0}',
        },
    },
};

const localization = (options: Options) =>
    options.locale
        ? errorsLocale[options.locale] ?? errorsLocale.en
        : errorsLocale.en;

const errorFormatter = (message: string, ...args: Array<any>): string => {
    args.forEach(
        (arg, index) => (message = message.replace(`{${index}}`, arg))
    );

    return message;
};

const error = (message: string, line: number, column: number): LangObject => ({
    kind: ObjectKind.ERROR,
    message,
    line,
    column,
});

const printError = (
    error: ParseError,
    file: string,
    stderr: Stdio,
    options: Options
) => {
    const { line, column, message } = error;

    stderr(
        `${
            options.stderrPrefix
                ? `${options.stderrColor ? `[Error]`.bgRed : `[Error]`} `
                : ''
        }${options.stderrColor ? message.red : message} (${
            options.stderrColor
                ? `${file} ${`${line}:${column}`.yellow}`
                : `${file} ${line}:${column}`
        })`
    );
};

export default error;
export { printError, localization, errorFormatter };

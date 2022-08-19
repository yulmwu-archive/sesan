import * as Tiny from '../../index';
import colors from 'colors';

colors.enabled = true;

export interface Errors {
    lexerError: {
        invalidIdentifier: string;
        invalidNumber: string;
        invalidString: string;
    };
    parserError: {
        unexpectedToken: string;
        unexpectedExpression: string;
        invalidBodyBlock: string;
        decoratorRequiresFunction: string;
        voidRequiresExpression: string;
    };
    runtimeError: {
        invalidArgument: string;
        invalidFunction: string;
        identifierNotDefined_1: string;
        identifierNotDefined_2: string;
        typeMismatch_1: string;
        typeMismatch_2: string;
        indexOutOfRange: string;
        deleteRequiresIdentifier: string;
        useRequiresString: string;
    };
    builtinError: {
        invalidArgument: string;
        disableAllowEval: string;
        disableAllowJavaScript: string;
        couldNotEval: string;
    };
}

const errorsLocale: Record<'en' | 'ko', Errors> = {
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
            invalidBodyBlock: `Invalid body block.`,
            decoratorRequiresFunction: `Decorator requires a function.`,
            voidRequiresExpression: `'void' requires an expression.`,
        },
        runtimeError: {
            invalidArgument: "'{0}' expected {1} arguments but got {2}.",
            invalidFunction: "'{0}' is not a function.",
            identifierNotDefined_1: "'{0}' is not defined.",
            identifierNotDefined_2: "Identifier '{0}' is not defined.",
            typeMismatch_1: 'Type mismatch.',
            typeMismatch_2: 'Type mismatch: [{0}], [{1}].',
            indexOutOfRange: 'Index out of range.',
            deleteRequiresIdentifier:
                "'delete' can only be used on identifiers.",
            useRequiresString: "'use' can only be used on strings.",
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
            invalidBodyBlock: `유효하지 않은 블록입니다.`,
            decoratorRequiresFunction: `데코레이터는 함수를 요구합니다.`,
            voidRequiresExpression: `'void'는 식을 요구합니다.`,
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
            deleteRequiresIdentifier:
                "'delete' 는 식별자만 사용할 수 있습니다.",
            useRequiresString: "'use' 는 문자열만 사용할 수 있습니다.",
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

export const localization = (options: Tiny.Options) =>
    options.locale
        ? (errorsLocale as { [key: string]: Errors })[options.locale] ??
          errorsLocale.en
        : errorsLocale.en;

export const errorFormatter = (message: string, ...args: Array<any>): string =>
    args.reduce(
        (message, curr, index) => message.replaceAll(`{${index}}`, curr),
        message
    );

export const error = (
    message: string,
    line: number,
    column: number
): Tiny.LangObject => ({
    kind: Tiny.ObjectKind.ERROR,
    message,
    line,
    column,
});

export const printError = (
    error: Tiny.ParseError,
    file: string,
    stderr: Tiny.Stdio,
    options: Tiny.Options
) => {
    const { line, column, message } = error;

    stderr(
        `${
            options.stderrPrefix
                ? `${options.stderrColor ? `[Error]`.bgRed : `[Error]`} `
                : ''
        }${options.stderrColor ? message.red : message} (${
            options.stderrColor
                ? `${file}:${`${line}:${column}`.yellow}`
                : `${file}:${line}:${column}`
        })`
    );
};

export default error;

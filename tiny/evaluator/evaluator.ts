import { readFileSync } from 'node:fs';
import * as Tiny from '../../index';

export const NULL: Tiny.LangObject = { kind: Tiny.ObjectKind.NULL };

export default class Evaluator {
    public messages: Tiny.Errors;

    constructor(
        public program: Tiny.Program,
        public enviroment: Tiny.Enviroment,
        public options: Tiny.Options,
        public stdio: Tiny.StdioOptions = {
            stdin: Tiny.stdin,
            stdout: Tiny.stdout,
            stderr: Tiny.stderr,
        },
        public filename: string,
        public root: string = './'
    ) {
        this.messages = Tiny.localization(options);
    }

    public eval(): Tiny.LangObject {
        if (this.program.errors.length > 0) return null;

        return this.evalStatements(this.program.statements, this.enviroment);
    }

    private evalStatements(
        statements: Array<Tiny.Statement>,
        enviroment: Tiny.Enviroment
    ): Tiny.LangObject {
        let results: Array<Tiny.LangObject> = [];

        for (const statement of statements) {
            const result = this.evalStatement(statement, enviroment);

            results.push(result);

            if (result) {
                if (result.kind === Tiny.ObjectKind.RETURN_VALUE)
                    return result.value;
                if (result.kind === Tiny.ObjectKind.ERROR) return result;
            }
        }

        if (results.length === 0) return NULL;

        return results[results.length - 1];
    }

    private evalBlockStatements(
        statement: Tiny.BlockStatement,
        enviroment: Tiny.Enviroment
    ): Tiny.LangObject {
        const { statements, returnFinal } = statement;

        let results: Array<Tiny.LangObject> = [];

        for (const statement of statements) {
            const result = this.evalStatement(statement, enviroment);

            results.push(result);

            if (result) {
                if (result.kind === Tiny.ObjectKind.RETURN_VALUE) return result;
                if (result.kind === Tiny.ObjectKind.ERROR) return result;
            }
        }

        if (results.length === 0) return NULL;

        if (returnFinal) return results[results.length - 1];
        else return NULL;
    }

    private evalStatement(
        statement: Tiny.Statement,
        enviroment: Tiny.Enviroment
    ): Tiny.LangObject {
        switch (statement.kind) {
            case Tiny.NodeKind.ExpressionStatement:
                return this.evalExpression(statement.expression, enviroment);

            case Tiny.NodeKind.LetStatement: {
                const value = this.evalExpression(statement.value, enviroment);
                if (value?.kind === Tiny.ObjectKind.ERROR) return value;

                const name = (statement.ident as unknown as Tiny.StringLiteral)
                    .value;

                if (statement.ident)
                    if (
                        enviroment.has(name) &&
                        !name.startsWith('_') &&
                        this.options.strictMode
                    )
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError
                                    .identifierAlreadyDefined,
                                name
                            ),
                            statement.line,
                            statement.column
                        );
                    else if (name !== '_') enviroment.set(name, value);

                return null;
            }

            case Tiny.NodeKind.ReturnStatement: {
                const expression = this.evalExpression(
                    (statement as unknown as Tiny.ReturnStatement).value,
                    enviroment
                );

                if (expression)
                    return {
                        value: expression,
                        kind: Tiny.ObjectKind.RETURN_VALUE,
                    };

                return NULL;
            }

            case Tiny.NodeKind.WhileStatement: {
                let condition = this.evalExpression(
                    (statement as unknown as Tiny.WhileStatement).condition,
                    enviroment
                );

                if (condition?.kind === Tiny.ObjectKind.ERROR) return condition;

                const res: Array<Tiny.LangObject> = [];

                while (this.isTruthy(condition)) {
                    const result = this.evalExpression(
                        (statement as unknown as Tiny.WhileStatement).body,
                        enviroment
                    );

                    if (result?.kind === Tiny.ObjectKind.ERROR) return result;

                    condition = this.evalExpression(
                        (statement as unknown as Tiny.WhileStatement).condition,
                        enviroment
                    );

                    if (condition?.kind === Tiny.ObjectKind.ERROR)
                        return condition;

                    res.push(result);
                }

                return NULL;
            }

            case Tiny.NodeKind.DecoratorStatement: {
                const decorator =
                    statement as unknown as Tiny.DecoratorStatement;

                const value = this.evalExpression(decorator.value, enviroment);

                if (value?.kind === Tiny.ObjectKind.ERROR) return value;

                const func = this.evalFunction(
                    decorator.function as Tiny.FunctionExpression,
                    enviroment,
                    value
                );

                if (func?.kind !== Tiny.ObjectKind.FUNCTION) return null;

                return func;
            }

            default:
                return NULL;
        }
    }

    private evalExpression(
        expression: Tiny.Expression,
        enviroment: Tiny.Enviroment
    ): Tiny.LangObject {
        if (!expression) return null;

        switch (expression.kind) {
            case Tiny.ExpressionKind.Literal:
                return this.evalLiteral(expression as Tiny.LiteralExpression);

            case Tiny.ExpressionKind.Prefix: {
                return this.evalPrefix(
                    expression.operator,
                    expression.right,
                    enviroment,
                    {
                        line: expression.line,
                        column: expression.column,
                    }
                );
            }

            case Tiny.ExpressionKind.Infix:
                const infix = expression as unknown as Tiny.InfixExpression;

                switch (infix.operator) {
                    case Tiny.TokenType.ASSIGN:
                        return this.evalIdentInfix(
                            infix.operator,
                            infix.left,
                            infix.right,
                            enviroment,
                            {
                                line: infix.line,
                                column: infix.column,
                            }
                        );

                    case Tiny.TokenType.ELEMENT:
                        return this.evalElementInfix(
                            infix.left,
                            infix.right,
                            enviroment,
                            {
                                line: infix.line,
                                column: infix.column,
                            }
                        );
                }

                return this.evalInfix(
                    infix.operator,
                    infix.left,
                    infix.right,
                    enviroment,
                    {
                        line: infix.line,
                        column: infix.column,
                    }
                );

            case Tiny.ExpressionKind.Block:
                return this.evalBlockStatements(
                    expression as unknown as Tiny.BlockStatement,
                    enviroment
                );

            case Tiny.ExpressionKind.If: {
                return this.evalIfExpression(
                    expression.condition,
                    expression.consequence,
                    expression.alternative,
                    enviroment
                );
            }

            case Tiny.ExpressionKind.Ident:
                return this.evalIdent(
                    (expression as unknown as Tiny.StringLiteral).value,
                    enviroment,
                    {
                        line: expression.line,
                        column: expression.column,
                    }
                );

            case Tiny.ExpressionKind.Function:
                return this.evalFunction(
                    expression as unknown as Tiny.FunctionExpression,
                    enviroment
                );

            case Tiny.ExpressionKind.Call:
                return this.evalCallExpression(
                    expression as unknown as Tiny.CallExpression,
                    enviroment
                );

            case Tiny.ExpressionKind.Array: {
                const args = this.evalExpressions(
                    expression.elements,
                    enviroment
                );

                if (args.length == 1 && args[0]?.kind === Tiny.ObjectKind.ERROR)
                    return args[0];

                return {
                    value: args,
                    kind: Tiny.ObjectKind.ARRAY,
                };
            }

            case Tiny.ExpressionKind.Index: {
                const _expression = this.evalExpression(
                    expression.left,
                    enviroment
                );
                if (!_expression) return null;

                if (_expression.kind === Tiny.ObjectKind.ERROR) return NULL;

                const index = this.evalExpression(expression.index, enviroment);
                if (!index) return null;

                if (index.kind === Tiny.ObjectKind.ERROR) return NULL;

                return this.evalIndex(_expression, index, {
                    line: expression.line,
                    column: expression.column,
                });
            }

            case Tiny.ExpressionKind.Hash:
                return this.evalHashParameters(
                    (expression as unknown as Tiny.HashExpression).pairs,
                    enviroment
                );

            case Tiny.ExpressionKind.Typeof: {
                const value = this.evalExpression(expression.value, enviroment);

                if (value?.kind === Tiny.ObjectKind.ERROR) return value;

                if (!value) return NULL;

                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: Tiny.objectKindStringify(value.kind),
                };
            }

            case Tiny.ExpressionKind.Throw: {
                const message = this.evalExpression(
                    expression.message,
                    enviroment
                );

                if (message?.kind === Tiny.ObjectKind.ERROR) return message;

                if (!message) return NULL;

                return Tiny.error(
                    Tiny.objectStringify(message),
                    expression.line,
                    expression.column
                );
            }

            case Tiny.ExpressionKind.Delete: {
                if (expression.value?.kind !== Tiny.ExpressionKind.Ident)
                    return Tiny.error(
                        this.messages.runtimeError.deleteRequiresIdentifier,
                        expression.line,
                        expression.column
                    );

                enviroment.delete(
                    (expression.value as unknown as Tiny.StringLiteral).value
                );

                return NULL;
            }

            case Tiny.ExpressionKind.Use: {
                const path = this.evalExpression(expression.path, enviroment);

                if (path?.kind === Tiny.ObjectKind.ERROR) return path;

                if (path?.kind !== Tiny.ObjectKind.STRING)
                    return Tiny.error(
                        this.messages.runtimeError.useRequiresString,
                        expression.line,
                        expression.column
                    );

                return this.importEnv(
                    (path as unknown as Tiny.StringObject).value,
                    enviroment,
                    this,
                    {
                        line: expression.line,
                        column: expression.column,
                    }
                );
            }

            default:
                return null;
        }
    }

    public importEnv(
        path: string,
        enviroment: Tiny.Enviroment,
        evaluator: Evaluator,
        position: Tiny.Position
    ): Tiny.LangObject {
        try {
            if (!path.endsWith('.tiny')) path += '.tiny';

            const parsed = new Tiny.Parser(
                new Tiny.Lexer(
                    readFileSync(`${evaluator.root}${path}`, 'utf8'),
                    {
                        ...evaluator.options,
                        stderr: evaluator.stdio.stderr,
                    },
                    path
                ),
                evaluator.options
            ).parseProgram();

            parsed.errors.forEach((error) =>
                Tiny.printError(error, path, evaluator.stdio.stderr, {
                    ...evaluator.options,
                })
            );

            return new Tiny.Evaluator(
                parsed,
                enviroment,
                evaluator.options,
                evaluator.stdio,
                evaluator.root
            ).eval();
        } catch (e) {
            return {
                kind: Tiny.ObjectKind.ERROR,
                message: `Could not import file: ${evaluator.root}${path}`,
                ...position,
            };
        }
    }

    private evalFunction(
        expression: Tiny.FunctionExpression,
        enviroment: Tiny.Enviroment,
        decorator?: Tiny.LangObject
    ): Tiny.LangObject {
        const functionObject: Tiny.LangObject = {
            function: expression.function ?? null,
            parameters: expression.parameters,
            body: expression.body,
            enviroment: enviroment,
            option: this.options,
            decorator: decorator as Tiny.HashObject,
            kind: Tiny.ObjectKind.FUNCTION,
        };

        const name = functionObject.function
            ? (functionObject.function as unknown as Tiny.StringLiteral)
                  .value ?? null
            : null;

        if (expression.function && name)
            if (
                enviroment.has(name) &&
                !name.startsWith('_') &&
                this.options.strictMode
            )
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.functionAlreadyDefined,
                        name
                    ),
                    expression.line,
                    expression.column
                );
            else if (name !== '_') enviroment.set(name, functionObject);

        return functionObject;
    }

    private evalCallExpression(
        expression: Tiny.CallExpression,
        enviroment: Tiny.Enviroment
    ): Tiny.LangObject {
        const functionObject = this.evalExpression(
            expression.function,
            enviroment
        );

        if (functionObject?.kind === Tiny.ObjectKind.ERROR)
            return functionObject;

        const args = this.evalExpressions(expression.parameters, enviroment);

        if (args.length == 1 && args[0]?.kind === Tiny.ObjectKind.ERROR)
            return args[0];

        return this.applyFunction(
            functionObject as Tiny.FunctionObject,
            (expression.function as unknown as Tiny.StringLiteral).value,
            args,
            enviroment,
            {
                line: expression.line,
                column: expression.column,
            },
            {
                kind: Tiny.ObjectKind.HASH,
                pairs: new Map<
                    Tiny.StringObject | Tiny.NumberObject,
                    Tiny.LangObject
                >([
                    [
                        {
                            kind: Tiny.ObjectKind.STRING,
                            value: 'arguments',
                        },
                        {
                            kind: Tiny.ObjectKind.ARRAY,
                            value: args,
                        },
                    ],
                    [
                        {
                            kind: Tiny.ObjectKind.STRING,
                            value: 'decorator',
                        },
                        (functionObject as Tiny.FunctionObject).decorator ??
                            NULL,
                    ],
                ]),
            }
        );
    }

    private evalHashParameters(
        parameters: Array<Tiny.HashPair>,
        enviroment: Tiny.Enviroment
    ): Tiny.HashObject {
        const hash: Tiny.HashObject = {
            kind: Tiny.ObjectKind.HASH,
            pairs: new Map(),
        };

        parameters.forEach((arg: Tiny.HashPair) => {
            const key = this.evalExpression(arg.key, enviroment);
            if (!key) return;

            if (key.kind === Tiny.ObjectKind.ERROR) return key;

            const value = this.evalExpression(arg.value, enviroment);
            if (!value) return;

            if (value.kind === Tiny.ObjectKind.ERROR) return key;

            if (
                key.kind !== Tiny.ObjectKind.STRING &&
                key.kind !== Tiny.ObjectKind.NUMBER
            )
                return;

            if (key) hash.pairs.set(key, value);
        });

        return hash;
    }

    private evalExpressions(
        expression: Array<Tiny.Expression>,
        enviroment: Tiny.Enviroment
    ): Array<Tiny.LangObject> {
        return expression.map((expression: Tiny.Expression) =>
            this.evalExpression(expression, enviroment)
        );
    }

    private getDecorator(
        key: string | number,
        func: Tiny.FunctionObject
    ): Tiny.LangObject | null {
        if (!func.decorator) return null;

        return (
            new Map(
                [...func.decorator.pairs].map(([key, value]) => [
                    key.value,
                    value,
                ])
            ).get(key) ?? NULL
        );
    }

    public applyFunction(
        functionObject: Tiny.FunctionObject,
        name: string,
        parameters: Array<Tiny.LangObject>,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position,
        thisObject: Tiny.LangObject
    ): Tiny.LangObject {
        if (functionObject?.kind === Tiny.ObjectKind.FUNCTION) {
            if (
                !this.getDecorator('skipCheckArguments', functionObject) &&
                functionObject.parameters.length !== parameters.length
            )
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.invalidArgument,
                        name,
                        functionObject.parameters.length,
                        parameters.length
                    ),
                    position.line,
                    position.column
                );

            const result = this.evalExpression(
                functionObject.body,
                this.extendFunctionEnv(
                    functionObject,
                    parameters,
                    enviroment,
                    thisObject,
                    this.getDecorator('capture', functionObject)
                        ? (
                              this.getDecorator(
                                  'capture',
                                  functionObject
                              ) as Tiny.BooleanObject
                          ).value
                        : false
                )
            );

            if (result?.kind === Tiny.ObjectKind.RETURN_VALUE)
                return result.value;
            if (result?.kind === Tiny.ObjectKind.ERROR) return result;

            return result;
        }

        if (functionObject?.kind === Tiny.ObjectKind.BUILTIN)
            return (functionObject as unknown as Tiny.BuiltinFunction).func(
                parameters,
                enviroment,
                this,
                position
            );

        return Tiny.error(
            Tiny.errorFormatter(
                this.messages.runtimeError.invalidFunction,
                name
            ),
            position.line,
            position.column
        );
    }

    private extendFunctionEnv(
        functionObject: Tiny.LangObject,
        parameters: Array<Tiny.LangObject>,
        enviroment: Tiny.Enviroment,
        thisObject: Tiny.LangObject,
        capture: boolean
    ): Tiny.Enviroment {
        if (functionObject?.kind === Tiny.ObjectKind.FUNCTION) {
            let extendEnviroment = new Tiny.Enviroment(enviroment);

            if (capture) extendEnviroment = functionObject.enviroment;

            functionObject.parameters.forEach(
                (param: Tiny.Expression, i: number) => {
                    if (param?.kind === Tiny.ExpressionKind.Ident)
                        extendEnviroment.set(
                            (param as unknown as Tiny.StringLiteral).value,
                            parameters[i]
                        );
                }
            );

            extendEnviroment.set('this', thisObject);

            return extendEnviroment;
        }

        return new Tiny.Enviroment();
    }

    private evalIdent(
        name: string,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (enviroment.get(name)) return enviroment.get(name);

        const builtin = Tiny.builtinFunction(name);

        if (!builtin)
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.identifierNotDefined_2,
                    name
                ),
                position.line,
                position.column
            );

        return builtin;
    }

    private evalLiteral(literal: Tiny.LiteralExpression): Tiny.LangObject {
        switch (literal.value.kind) {
            case Tiny.LiteralKind.Number:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: literal.value.value,
                };

            case Tiny.LiteralKind.String:
                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: literal.value.value,
                };

            case Tiny.LiteralKind.Boolean:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: literal.value.value,
                };

            default:
                return NULL;
        }
    }

    private evalPrefix(
        operator: Tiny.TokenType,
        right: Tiny.Expression,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position
    ): Tiny.LangObject {
        const expression = this.evalExpression(right, enviroment);

        if (expression?.kind === Tiny.ObjectKind.ERROR) return expression;

        switch (operator) {
            case Tiny.TokenType.MINUS:
                return this.evalMinus(expression, position);

            case Tiny.TokenType.BANG:
                return this.evalBang(expression);

            default:
                return NULL;
        }
    }

    private evalInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.Expression,
        rightOperand: Tiny.Expression,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position
    ): Tiny.LangObject {
        const left = this.evalExpression(leftOperand, enviroment);

        if (left?.kind === Tiny.ObjectKind.ERROR) return left;

        const right = this.evalExpression(rightOperand, enviroment);

        if (right?.kind === Tiny.ObjectKind.ERROR) return right;

        if (operator === Tiny.TokenType.NULLISH)
            return left?.kind === Tiny.ObjectKind.NULL ? right : left;

        switch (left?.kind) {
            case Tiny.ObjectKind.NUMBER:
                return this.evalNumberInfix(operator, left, right, position);

            case Tiny.ObjectKind.STRING:
                return this.evalStringInfix(operator, left, right, position);

            case Tiny.ObjectKind.BOOLEAN:
                return this.evalBooleanInfix(operator, left, right, position);

            case Tiny.ObjectKind.HASH:
                return this.evalHashInfix(operator, left, right, position);

            case Tiny.ObjectKind.ARRAY:
                return this.evalArrayInfix(operator, left, right, position);

            default:
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.typeMismatch_2,
                        left?.kind,
                        right?.kind
                    ),
                    position.line,
                    position.column
                );
        }
    }

    private typeMissmatch(
        left: Tiny.LangObject,
        right: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        return Tiny.error(
            Tiny.errorFormatter(
                this.messages.runtimeError.typeMismatch_2,
                Tiny.objectKindStringify(left?.kind ?? Tiny.ObjectKind.NULL),
                Tiny.objectKindStringify(right?.kind ?? Tiny.ObjectKind.NULL)
            ),
            position.line,
            position.column
        );
    }

    private evalNumberInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN)
            return this.evalInOperator(leftOperand, rightOperand, position);

        if (
            leftOperand?.kind !== Tiny.ObjectKind.NUMBER ||
            rightOperand?.kind !== Tiny.ObjectKind.NUMBER
        )
            return this.typeMissmatch(leftOperand, rightOperand, position);

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value + rightOperand.value,
                };

            case Tiny.TokenType.MINUS:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value - rightOperand.value,
                };

            case Tiny.TokenType.SLASH:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value / rightOperand.value,
                };

            case Tiny.TokenType.ASTERISK:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value * rightOperand.value,
                };

            case Tiny.TokenType.PERCENT:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value % rightOperand.value,
                };

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                };

            case Tiny.TokenType.GT:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value > rightOperand.value,
                };

            case Tiny.TokenType.LT:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value < rightOperand.value,
                };

            case Tiny.TokenType.GTE:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value >= rightOperand.value,
                };

            case Tiny.TokenType.LTE:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value <= rightOperand.value,
                };

            default:
                return null;
        }
    }

    private evalBooleanInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN)
            return this.evalInOperator(leftOperand, rightOperand, position);

        if (
            leftOperand?.kind !== Tiny.ObjectKind.BOOLEAN ||
            rightOperand?.kind !== Tiny.ObjectKind.BOOLEAN
        )
            return this.typeMissmatch(leftOperand, rightOperand, position);

        switch (operator) {
            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                };

            case Tiny.TokenType.AND:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value && rightOperand.value,
                };

            case Tiny.TokenType.OR:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value || rightOperand.value,
                };

            default:
                return null;
        }
    }

    private evalStringInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN)
            return this.evalInOperator(leftOperand, rightOperand, position);

        if (
            leftOperand?.kind !== Tiny.ObjectKind.STRING ||
            rightOperand?.kind !== Tiny.ObjectKind.STRING
        )
            return this.typeMissmatch(leftOperand, rightOperand, position);

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: `${leftOperand.value}${rightOperand.value}`,
                };

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                };

            default:
                return null;
        }
    }

    private evalHashInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        switch (operator) {
            case Tiny.TokenType.IN:
                return this.evalInOperator(leftOperand, rightOperand, position);
        }

        if (
            leftOperand?.kind !== Tiny.ObjectKind.HASH ||
            rightOperand?.kind !== Tiny.ObjectKind.HASH
        )
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Tiny.objectKindStringify(
                        leftOperand?.kind ?? Tiny.ObjectKind.NULL
                    ),
                    Tiny.objectKindStringify(
                        rightOperand?.kind ?? Tiny.ObjectKind.NULL
                    )
                ),
                position.line,
                position.column
            );

        switch (operator) {
            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(leftOperand.pairs) ===
                        JSON.stringify(rightOperand.pairs),
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(leftOperand.pairs) !==
                        JSON.stringify(rightOperand.pairs),
                };

            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.HASH,
                    pairs: new Map([
                        ...[...leftOperand.pairs.entries()].filter(
                            ([k]) =>
                                !new Map(
                                    [...rightOperand.pairs.entries()].map(
                                        ([k, v]) => [JSON.stringify(k), v]
                                    )
                                ).has(JSON.stringify(k))
                        ),
                        ...rightOperand.pairs,
                    ]),
                };

            default:
                return null;
        }
    }

    private evalArrayInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        switch (operator) {
            case Tiny.TokenType.IN:
                return this.evalInOperator(leftOperand, rightOperand, position);
        }

        if (
            leftOperand?.kind !== Tiny.ObjectKind.ARRAY ||
            rightOperand?.kind !== Tiny.ObjectKind.ARRAY
        )
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Tiny.objectKindStringify(
                        leftOperand?.kind ?? Tiny.ObjectKind.NULL
                    ),
                    Tiny.objectKindStringify(
                        rightOperand?.kind ?? Tiny.ObjectKind.NULL
                    )
                ),
                position.line,
                position.column
            );

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.ARRAY,
                    value: [...leftOperand.value, ...rightOperand.value],
                };

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(leftOperand.value) ===
                        JSON.stringify(rightOperand.value),
                };

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value:
                        JSON.stringify(leftOperand.value) !==
                        JSON.stringify(rightOperand.value),
                };

            default:
                return null;
        }
    }

    private evalIdentInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.Expression,
        rightOperand: Tiny.Expression,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.ASSIGN) {
            const _right = this.evalExpression(rightOperand, enviroment);

            if (_right?.kind === Tiny.ObjectKind.ERROR) return _right;

            if (
                leftOperand?.kind !== Tiny.ExpressionKind.Ident &&
                leftOperand?.kind !== Tiny.ExpressionKind.Index
            )
                return Tiny.error(
                    this.messages.runtimeError.typeMismatch_1,
                    position.line,
                    position.column
                );

            switch (leftOperand.kind) {
                case Tiny.ExpressionKind.Ident: {
                    if (
                        !enviroment.get(
                            (leftOperand as unknown as Tiny.StringLiteral).value
                        )
                    )
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError
                                    .identifierNotDefined_1,
                                (leftOperand as unknown as Tiny.StringLiteral)
                                    .value
                            ),
                            position.line,
                            position.column
                        );

                    enviroment.update(
                        (leftOperand as unknown as Tiny.StringLiteral).value,
                        _right
                    );

                    return _right;
                }

                case Tiny.ExpressionKind.Index: {
                    const index = (
                        leftOperand as unknown as Tiny.IndexExpression
                    ).index;

                    const _left = this.evalExpression(
                        (leftOperand as unknown as Tiny.IndexExpression).left,
                        enviroment
                    );

                    if (_left?.kind === Tiny.ObjectKind.ERROR) return _left;

                    if (
                        _left?.kind !== Tiny.ObjectKind.ARRAY &&
                        _left?.kind !== Tiny.ObjectKind.HASH
                    )
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError.typeMismatch_2,
                                Tiny.objectKindStringify(
                                    _left?.kind ?? Tiny.ObjectKind.NULL
                                ),
                                Tiny.objectKindStringify(Tiny.ObjectKind.ARRAY)
                            ),
                            position.line,
                            position.column
                        );

                    if (_left?.kind === Tiny.ObjectKind.ARRAY) {
                        const _index = this.evalExpression(index, enviroment);

                        if (_index?.kind === Tiny.ObjectKind.ERROR)
                            return _index;

                        if (_index?.kind !== Tiny.ObjectKind.NUMBER)
                            return Tiny.error(
                                this.messages.runtimeError.typeMismatch_1,
                                position.line,
                                position.column
                            );

                        const _value = this.evalExpression(
                            rightOperand,
                            enviroment
                        );

                        if (_value?.kind === Tiny.ObjectKind.ERROR)
                            return _value;

                        if (_value?.kind !== Tiny.ObjectKind.NUMBER)
                            return Tiny.error(
                                this.messages.runtimeError.typeMismatch_2,
                                position.line,
                                position.column
                            );

                        (_left as unknown as Tiny.ArrayObject).value[
                            _index.value
                        ] = _value;

                        return _value;
                    } else {
                        const _index = this.evalExpression(index, enviroment);

                        if (_index?.kind === Tiny.ObjectKind.ERROR)
                            return _index;

                        if (
                            _index?.kind !== Tiny.ObjectKind.STRING &&
                            _index?.kind !== Tiny.ObjectKind.NUMBER
                        )
                            return Tiny.error(
                                this.messages.runtimeError.typeMismatch_1,
                                position.line,
                                position.column
                            );

                        const _value = this.evalExpression(
                            rightOperand,
                            enviroment
                        );

                        if (_value?.kind === Tiny.ObjectKind.ERROR)
                            return _value;

                        _left.pairs = new Map(
                            Array.from(
                                new Map([
                                    ...new Map(
                                        [..._left.pairs].map(([k, v]) => [
                                            k.value,
                                            v,
                                        ])
                                    ),
                                    [_index.value, _value],
                                ]).entries()
                            ).map(([k, v]) => [
                                typeof k === 'string'
                                    ? {
                                          value: k,
                                          kind: Tiny.ObjectKind.STRING,
                                      }
                                    : {
                                          value: k,
                                          kind: Tiny.ObjectKind.NUMBER,
                                      },
                                v,
                            ])
                        );

                        return _value;
                    }
                }
            }
        }

        return null;
    }

    private evalElementInfix(
        leftOperand: Tiny.Expression,
        rightOperand: Tiny.Expression,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position
    ): Tiny.LangObject {
        const left = this.evalExpression(leftOperand, enviroment);

        if (left?.kind === Tiny.ObjectKind.ERROR) return left;

        if (
            left?.kind !== Tiny.ObjectKind.HASH &&
            left?.kind !== Tiny.ObjectKind.ARRAY
        )
            return null;

        let right: Tiny.LangObject | Tiny.CallExpression = null;

        if (rightOperand?.kind === Tiny.ExpressionKind.Ident)
            right = {
                kind: Tiny.ObjectKind.STRING,
                value: rightOperand.value,
            };
        else if (rightOperand?.kind === Tiny.ExpressionKind.Call)
            right = rightOperand;
        else right = this.evalExpression(rightOperand, enviroment);

        if (right?.kind === Tiny.ObjectKind.ERROR) return right;

        if (left.kind === Tiny.ObjectKind.ARRAY)
            if (right?.kind === Tiny.ObjectKind.NUMBER)
                return this.evalIndex(left, right, position);
            else NULL;

        if (
            right?.kind === Tiny.ObjectKind.NUMBER ||
            right?.kind === Tiny.ObjectKind.STRING
        ) {
            return (
                new Map(
                    [...(left as Tiny.HashObject).pairs].map(([key, value]) => [
                        key.value,
                        value,
                    ])
                ).get(right.value) ?? NULL
            );
        } else if (right?.kind === Tiny.ExpressionKind.Call) {
            const expression =
                new Map(
                    [...(left as Tiny.HashObject).pairs].map(([key, value]) => [
                        key.value,
                        value,
                    ])
                ).get(
                    (right.function as unknown as Tiny.StringLiteral).value
                ) ?? NULL;

            if (expression?.kind === Tiny.ObjectKind.ERROR) return expression;

            if (expression?.kind !== Tiny.ObjectKind.FUNCTION)
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.invalidFunction,
                        (right.function as unknown as Tiny.StringLiteral).value
                    ),
                    position.line,
                    position.column
                );

            return this.evalCallExpression(
                {
                    kind: Tiny.ExpressionKind.Call,
                    function: {
                        kind: Tiny.ExpressionKind.Function,
                        function: expression.function,
                        parameters: expression.parameters,
                        body: expression.body,
                        ...position,
                    },
                    parameters: right.parameters,
                    ...position,
                },
                enviroment
            );
        } else return NULL;
    }

    private evalInOperator(
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        switch (rightOperand?.kind) {
            case Tiny.ObjectKind.ARRAY:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: rightOperand.value
                        .map((x) => JSON.stringify(x))
                        .includes(JSON.stringify(leftOperand)),
                };

            case Tiny.ObjectKind.HASH: {
                if (
                    leftOperand?.kind === Tiny.ObjectKind.STRING ||
                    leftOperand?.kind === Tiny.ObjectKind.NUMBER
                )
                    return {
                        kind: Tiny.ObjectKind.BOOLEAN,
                        value: [...rightOperand.pairs.keys()]
                            .map((x) => JSON.stringify(x))
                            .includes(JSON.stringify(leftOperand)),
                    };
                else
                    return this.typeMissmatch(
                        leftOperand,
                        rightOperand,
                        position
                    );
            }

            case Tiny.ObjectKind.STRING:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: rightOperand.value.includes(
                        (leftOperand as Tiny.StringObject).value
                    ),
                };

            case Tiny.ObjectKind.NUMBER:
                if (leftOperand?.kind === Tiny.ObjectKind.HASH)
                    return {
                        kind: Tiny.ObjectKind.BOOLEAN,
                        value: [...leftOperand.pairs.values()]
                            .map((x) => JSON.stringify(x))
                            .includes(JSON.stringify(rightOperand)),
                    };
                else
                    return this.typeMissmatch(
                        leftOperand,
                        rightOperand,
                        position
                    );

            default:
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.typeMismatch_2,
                        Tiny.objectKindStringify(
                            leftOperand?.kind ?? Tiny.ObjectKind.NULL
                        ),
                        Tiny.objectKindStringify(
                            rightOperand?.kind ?? Tiny.ObjectKind.NULL
                        )
                    ),
                    position.line,
                    position.column
                );
        }
    }

    private evalIfExpression(
        condition: Tiny.Expression,
        consequence: Tiny.Expression,
        alternative: Tiny.Expression,
        enviroment: Tiny.Enviroment
    ): Tiny.LangObject {
        const conditionExpression = this.evalExpression(condition, enviroment);

        if (conditionExpression?.kind === Tiny.ObjectKind.ERROR)
            return conditionExpression;

        if (conditionExpression?.kind === Tiny.ObjectKind.BOOLEAN) {
            if (conditionExpression.value)
                return this.evalExpression(consequence, enviroment);
            else if (alternative)
                return this.evalExpression(alternative, enviroment);
            else return NULL;
        }

        return NULL;
    }

    private evalIndex(
        left: Tiny.LangObject,
        index: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        switch (left?.kind) {
            case Tiny.ObjectKind.ARRAY: {
                if (index?.kind === Tiny.ObjectKind.NUMBER)
                    return this.evalArrayIndex(left, index, position);

                return Tiny.error(
                    this.messages.runtimeError.typeMismatch_1,
                    position.line,
                    position.column
                );
            }

            case Tiny.ObjectKind.HASH: {
                let key: string | number;

                switch (index?.kind) {
                    case Tiny.ObjectKind.STRING:
                    case Tiny.ObjectKind.NUMBER:
                        key = index.value;
                        break;

                    default:
                        return Tiny.error(
                            this.messages.runtimeError.typeMismatch_1,
                            position.line,
                            position.column
                        );
                }

                return (
                    new Map(
                        [...left.pairs].map(([key, value]) => [
                            key.value,
                            value,
                        ])
                    ).get(key) ?? NULL
                );
            }

            default:
                return NULL;
        }
    }

    private evalArrayIndex(
        left: Tiny.LangObject,
        index: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (
            index?.kind !== Tiny.ObjectKind.NUMBER ||
            left?.kind !== Tiny.ObjectKind.ARRAY
        )
            return Tiny.error(
                this.messages.runtimeError.typeMismatch_1,
                position.line,
                position.column
            );

        if (index.value < 0 || index.value >= left.value.length)
            return Tiny.error(
                this.messages.runtimeError.indexOutOfRange,
                position.line,
                position.column
            );

        return left.value[index.value];
    }

    private isTruthy(object: Tiny.LangObject): boolean {
        if (!object) return false;

        switch (object.kind) {
            case Tiny.ObjectKind.BOOLEAN:
                return object.value;

            case Tiny.ObjectKind.NUMBER:
                return object.value !== 0;

            case Tiny.ObjectKind.NULL:
                return false;

            default:
                return true;
        }
    }

    private evalBang(object: Tiny.LangObject): Tiny.LangObject {
        return {
            kind: Tiny.ObjectKind.BOOLEAN,
            value: !this.isTruthy(object),
        };
    }

    private evalMinus(
        object: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (object?.kind !== Tiny.ObjectKind.NUMBER)
            return Tiny.error(
                this.messages.runtimeError.typeMismatch_1,
                position.line,
                position.column
            );

        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: -object.value,
        };
    }
}

import { readFileSync } from 'node:fs'
import * as Tiny from '../../index'

export const NULL: Tiny.LangObject = { kind: Tiny.ObjectKind.NULL }
export const UNDEFINED: Tiny.LangObject = { kind: Tiny.ObjectKind.UNDEFINED }

export interface EvaluatorOptions extends Tiny.Options {
    stdio: Record<'stdin' | 'stdout' | 'stderr', Tiny.Stdio>
    filename: string
    root: string
}

export default class Evaluator {
    public messages: Tiny.Errors

    constructor(public program: Tiny.Program, public enviroment: Tiny.Enviroment, public option: EvaluatorOptions) {
        this.messages = Tiny.localization(option)
    }

    public eval(): Tiny.LangObject {
        if (this.program.errors.length > 0) return null

        const result = this.evalStatements(this.program.statements, this.enviroment)

        if (result?.kind === Tiny.ObjectKind.ERROR) {
            Tiny.printError(result, this.option.filename, this.option.stdio.stderr, this.option)

            return null
        }

        return result
    }

    private evalStatements(statements: Array<Tiny.Statement>, enviroment: Tiny.Enviroment): Tiny.LangObject {
        let results: Array<Tiny.LangObject> = []

        for (const statement of statements) {
            const result = this.evalStatement(statement, enviroment)

            results.push(result)

            if (result) {
                if (result.kind === Tiny.ObjectKind.RETURN_VALUE) return result.value
                if (result.kind === Tiny.ObjectKind.ERROR) return result
            }
        }

        if (results.length === 0) return UNDEFINED

        return results[results.length - 1]
    }

    private evalBlockStatements(statement: Tiny.BlockStatement, enviroment: Tiny.Enviroment): Tiny.LangObject {
        const { statements, returnFinal } = statement

        let results: Array<Tiny.LangObject> = []

        for (const statement of statements) {
            const result = this.evalStatement(statement, enviroment)

            results.push(result)

            if (result) {
                if (result.kind === Tiny.ObjectKind.RETURN_VALUE) return result
                if (result.kind === Tiny.ObjectKind.ERROR) return result
            }
        }

        if (results.length === 0) return UNDEFINED

        if (returnFinal) return results[results.length - 1]
        else return UNDEFINED
    }

    private evalStatement(statement: Tiny.Statement, enviroment: Tiny.Enviroment): Tiny.LangObject {
        switch (statement.kind) {
            case Tiny.NodeKind.ExpressionStatement:
                return this.evalExpression(statement.expression, enviroment)

            case Tiny.NodeKind.LetStatement: {
                const value = this.evalExpression(statement.value, enviroment)
                if (value?.kind === Tiny.ObjectKind.ERROR) return value

                const name = (statement.ident as unknown as Tiny.StringLiteral).value

                if (statement.ident && name !== '_') enviroment.set(name, value)

                return null
            }

            case Tiny.NodeKind.ReturnStatement: {
                const expression = this.evalExpression((statement as unknown as Tiny.ReturnStatement).value, enviroment)

                if (expression)
                    return {
                        value: expression,
                        kind: Tiny.ObjectKind.RETURN_VALUE,
                    }

                return NULL
            }

            case Tiny.NodeKind.WhileStatement: {
                let condition = this.evalExpression((statement as unknown as Tiny.WhileStatement).condition, enviroment)
                if (condition?.kind === Tiny.ObjectKind.ERROR) return condition

                const resultExpr: Array<Tiny.LangObject> = []

                while (this.isTruthy(condition)) {
                    const result = this.evalExpression((statement as unknown as Tiny.WhileStatement).body, enviroment)
                    if (result?.kind === Tiny.ObjectKind.ERROR) return result

                    condition = this.evalExpression((statement as unknown as Tiny.WhileStatement).condition, enviroment)

                    if (condition?.kind === Tiny.ObjectKind.ERROR) return condition

                    resultExpr.push(result)
                }

                return NULL
            }

            case Tiny.NodeKind.DecoratorStatement: {
                const decorator = statement as unknown as Tiny.DecoratorStatement

                const value = this.evalExpression(decorator.value, enviroment)
                if (value?.kind === Tiny.ObjectKind.ERROR) return value

                const func = this.evalFunction(decorator.function as Tiny.FunctionExpression, enviroment, value)

                if (func?.kind !== Tiny.ObjectKind.FUNCTION) return null

                return func
            }

            default:
                return NULL
        }
    }

    private evalExpression(expression: Tiny.Expression, enviroment: Tiny.Enviroment): Tiny.LangObject {
        if (!expression) return null

        switch (expression.kind) {
            case Tiny.ExpressionKind.Literal:
                return this.evalLiteral(expression as Tiny.LiteralExpression)

            case Tiny.ExpressionKind.Prefix: {
                return this.evalPrefix(expression.operator, expression.right, enviroment, {
                    line: expression.line,
                    column: expression.column,
                })
            }

            case Tiny.ExpressionKind.Infix:
                const infix = expression as unknown as Tiny.InfixExpression

                switch (infix.operator) {
                    case Tiny.TokenType.ASSIGN:
                        return this.evalIdentInfix(infix.operator, infix.left, infix.right, enviroment, {
                            line: infix.line,
                            column: infix.column,
                        })

                    case Tiny.TokenType.ELEMENT:
                        return this.evalElementInfix(infix.left, infix.right, enviroment, {
                            line: infix.line,
                            column: infix.column,
                        })
                }

                return this.evalInfix(infix.operator, infix.left, infix.right, enviroment, {
                    line: infix.line,
                    column: infix.column,
                })

            case Tiny.ExpressionKind.Block:
                return this.evalBlockStatements(expression as unknown as Tiny.BlockStatement, enviroment)

            case Tiny.ExpressionKind.If: {
                return this.evalIfExpression(expression.condition, expression.consequence, expression.alternative, enviroment)
            }

            case Tiny.ExpressionKind.Ident:
                return this.evalIdent((expression as unknown as Tiny.StringLiteral).value, enviroment, {
                    line: expression.line,
                    column: expression.column,
                })

            case Tiny.ExpressionKind.Function:
                return this.evalFunction(expression as unknown as Tiny.FunctionExpression, enviroment)

            case Tiny.ExpressionKind.Call:
                return this.evalCallExpression(expression as unknown as Tiny.CallExpression, enviroment)

            case Tiny.ExpressionKind.Array: {
                const args = this.evalExpressions(expression.elements, enviroment)

                if (args.length == 1 && args[0]?.kind === Tiny.ObjectKind.ERROR) return args[0]

                return {
                    value: args,
                    kind: Tiny.ObjectKind.ARRAY,
                }
            }

            case Tiny.ExpressionKind.Index: {
                const resultExpr = this.evalExpression(expression.left, enviroment)
                if (!resultExpr) return null

                if (resultExpr.kind === Tiny.ObjectKind.ERROR) return NULL

                const index = this.evalExpression(expression.index, enviroment)
                if (!index) return null

                if (index.kind === Tiny.ObjectKind.ERROR) return NULL

                return this.evalIndex(resultExpr, index, {
                    line: expression.line,
                    column: expression.column,
                })
            }

            case Tiny.ExpressionKind.Object:
                return this.evalObjectParameters((expression as unknown as Tiny.ObjectExpression).pairs, enviroment)

            case Tiny.ExpressionKind.Typeof: {
                const value = this.evalExpression(expression.value, enviroment)
                if (value?.kind === Tiny.ObjectKind.ERROR) return value

                if (!value) return NULL

                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: Tiny.objectKindStringify(value.kind),
                }
            }

            case Tiny.ExpressionKind.Throw: {
                const message = this.evalExpression(expression.message, enviroment)
                if (message?.kind === Tiny.ObjectKind.ERROR) return message

                if (!message) return NULL

                return Tiny.error(Tiny.objectStringify(message), expression.line, expression.column)
            }

            case Tiny.ExpressionKind.Delete: {
                if (expression.value?.kind !== Tiny.ExpressionKind.Ident)
                    return Tiny.error(this.messages.runtimeError.deleteRequiresIdentifier, expression.line, expression.column)

                enviroment.delete((expression.value as unknown as Tiny.StringLiteral).value)

                return NULL
            }

            case Tiny.ExpressionKind.Use: {
                const path = this.evalExpression(expression.path, enviroment)
                if (path?.kind === Tiny.ObjectKind.ERROR) return path

                if (path?.kind !== Tiny.ObjectKind.STRING)
                    return Tiny.error(this.messages.runtimeError.useRequiresString, expression.line, expression.column)

                return this.importEnv((path as unknown as Tiny.StringObject).value, enviroment, this, {
                    line: expression.line,
                    column: expression.column,
                })
            }

            case Tiny.ExpressionKind.Void: {
                const value = this.evalExpression(expression.value, enviroment)
                if (value?.kind === Tiny.ObjectKind.ERROR) return value

                return UNDEFINED
            }

            case Tiny.ExpressionKind.Expr: {
                const value = this.evalExpression(expression.value, enviroment)

                if (value?.kind === Tiny.ObjectKind.ERROR)
                    return {
                        kind: Tiny.ObjectKind.OBJECT,
                        pairs: new Map([
                            [
                                {
                                    kind: Tiny.ObjectKind.STRING,
                                    value: 'message',
                                },
                                {
                                    kind: Tiny.ObjectKind.STRING,
                                    value: value.message,
                                },
                            ],
                            [
                                {
                                    kind: Tiny.ObjectKind.STRING,
                                    value: 'line',
                                },
                                {
                                    kind: Tiny.ObjectKind.NUMBER,
                                    value: value.line,
                                },
                            ],
                            [
                                {
                                    kind: Tiny.ObjectKind.STRING,
                                    value: 'column',
                                },
                                {
                                    kind: Tiny.ObjectKind.NUMBER,
                                    value: value.column,
                                },
                            ],
                            [
                                {
                                    kind: Tiny.ObjectKind.STRING,
                                    value: 'filename',
                                },
                                {
                                    kind: Tiny.ObjectKind.STRING,
                                    value: this.option.filename,
                                },
                            ],
                            [
                                {
                                    kind: Tiny.ObjectKind.STRING,
                                    value: 'error',
                                },
                                {
                                    kind: Tiny.ObjectKind.BOOLEAN,
                                    value: true,
                                },
                            ],
                        ]),
                    }

                return value
            }

            default:
                return null
        }
    }

    public importEnv(path: string, enviroment: Tiny.Enviroment, evaluator: Evaluator, position: Tiny.Position): Tiny.LangObject {
        try {
            if (!path.endsWith('.tiny')) path += '.tiny'

            const parsed = new Tiny.Parser(
                new Tiny.Lexer(
                    readFileSync(`${evaluator.option.root}${path}`, 'utf8'),
                    {
                        ...evaluator.option,
                        stderr: evaluator.option.stdio.stderr,
                    },
                    path
                ),
                evaluator.option
            ).parseProgram()

            parsed.errors.forEach((error) =>
                Tiny.printError(error, path, evaluator.option.stdio.stderr, {
                    ...evaluator.option,
                })
            )

            return new Tiny.Evaluator(parsed, enviroment, {
                ...evaluator.option,
                filename: path,
            }).eval()
        } catch (e) {
            return {
                kind: Tiny.ObjectKind.ERROR,
                message: `Could not import file: ${evaluator.option.root}${path}`,
                ...position,
            }
        }
    }

    private evalFunction(expression: Tiny.FunctionExpression, enviroment: Tiny.Enviroment, decorator?: Tiny.LangObject): Tiny.LangObject {
        const functionObject: Tiny.LangObject = {
            function: expression.function ?? null,
            parameters: expression.parameters,
            body: expression.body,
            enviroment: enviroment,
            option: this.option,
            decorator: decorator as Tiny.ObjectObject,
            kind: Tiny.ObjectKind.FUNCTION,
        }

        const name = functionObject.function ? (functionObject.function as unknown as Tiny.StringLiteral).value ?? null : null

        if (expression.function && name && name !== '_') enviroment.set(name, functionObject)

        return functionObject
    }

    private evalCallExpression(expression: Tiny.CallExpression, enviroment: Tiny.Enviroment): Tiny.LangObject {
        const functionObject = this.evalExpression(expression.function, enviroment)
        if (functionObject?.kind === Tiny.ObjectKind.ERROR) return functionObject

        const args = this.evalExpressions(expression.parameters, enviroment)

        if (args.length == 1 && args[0]?.kind === Tiny.ObjectKind.ERROR) return args[0]

        return this.applyFunction(
            functionObject as Tiny.FunctionObject,
            (expression.function as unknown as Tiny.StringLiteral).value,
            args,
            enviroment,
            { line: expression.line, column: expression.column },
            {
                kind: Tiny.ObjectKind.OBJECT,
                pairs: new Map<Tiny.StringObject | Tiny.NumberObject, Tiny.LangObject>([
                    [
                        { kind: Tiny.ObjectKind.STRING, value: 'arguments' },
                        { kind: Tiny.ObjectKind.ARRAY, value: args },
                    ],
                    [{ kind: Tiny.ObjectKind.STRING, value: 'decorator' }, (functionObject as Tiny.FunctionObject).decorator ?? NULL],
                ]),
            }
        )
    }

    private evalObjectParameters(parameters: Array<Tiny.ObjectPair>, enviroment: Tiny.Enviroment): Tiny.ObjectObject {
        const object: Tiny.ObjectObject = {
            kind: Tiny.ObjectKind.OBJECT,
            pairs: new Map(),
        }

        parameters.forEach((arg: Tiny.ObjectPair) => {
            const key = this.evalExpression(arg.key, enviroment)
            if (!key) return

            if (key.kind === Tiny.ObjectKind.ERROR) return key

            const value = this.evalExpression(arg.value, enviroment)
            if (!value) return

            if (value.kind === Tiny.ObjectKind.ERROR) return key

            if (key.kind !== Tiny.ObjectKind.STRING && key.kind !== Tiny.ObjectKind.NUMBER) return

            if (key) object.pairs.set(key, value)
        })

        return object
    }

    private evalExpressions(expression: Array<Tiny.Expression>, enviroment: Tiny.Enviroment): Array<Tiny.LangObject> {
        return expression.map((expression: Tiny.Expression) => this.evalExpression(expression, enviroment))
    }

    private getDecorator(key: string | number, func: Tiny.FunctionObject): Tiny.LangObject | null {
        if (!func.decorator) return null

        return new Map([...func.decorator.pairs].map(([key, value]) => [key.value, value])).get(key) ?? NULL
    }

    public applyFunction(
        functionObject: Tiny.FunctionObject,
        callName: string,
        parameters: Array<Tiny.LangObject>,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position,
        thisObject: Tiny.LangObject
    ): Tiny.LangObject {
        console.log(functionObject.function, callName)
        if (functionObject?.kind === Tiny.ObjectKind.FUNCTION) {
            if (!this.getDecorator('skipCheckArguments', functionObject) && functionObject.parameters.length !== parameters.length)
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.invalidArgument,
                        callName ?? '<Anonymous>',
                        functionObject.parameters.length,
                        parameters.length
                    ),
                    position.line,
                    position.column
                )

            const result = this.evalExpression(
                functionObject.body,
                this.extendFunctionEnv(
                    functionObject,
                    parameters,
                    enviroment,
                    thisObject,
                    (this.getDecorator('noCapture', functionObject) as Tiny.BooleanObject)?.value ?? false
                )
            )

            if (result?.kind === Tiny.ObjectKind.RETURN_VALUE) return result.value
            if (result?.kind === Tiny.ObjectKind.ERROR) return result

            return result
        }

        if (functionObject?.kind === Tiny.ObjectKind.BUILTIN)
            return (functionObject as unknown as Tiny.BuiltinFunction).func(parameters, enviroment, this, position)

        return Tiny.error(Tiny.errorFormatter(this.messages.runtimeError.invalidFunction, callName ?? '<unknown>'), position.line, position.column)
    }

    private extendFunctionEnv(
        functionObject: Tiny.LangObject,
        parameters: Array<Tiny.LangObject>,
        enviroment: Tiny.Enviroment,
        thisObject: Tiny.LangObject,
        noCapture: boolean
    ): Tiny.Enviroment {
        if (functionObject?.kind === Tiny.ObjectKind.FUNCTION) {
            let extendEnviroment = new Tiny.Enviroment(enviroment)

            if (!noCapture) extendEnviroment.outer = functionObject.enviroment

            functionObject.parameters.forEach((param: Tiny.Expression, i: number) => {
                if (param?.kind === Tiny.ExpressionKind.Ident) extendEnviroment.set((param as unknown as Tiny.StringLiteral).value, parameters[i])
            })

            extendEnviroment.set('this', thisObject)

            return extendEnviroment
        }

        return new Tiny.Enviroment()
    }

    private evalIdent(name: string, enviroment: Tiny.Enviroment, position: Tiny.Position): Tiny.LangObject {
        if (enviroment.get(name)) return enviroment.get(name)

        const builtin = Tiny.builtinFunction(name)

        if (!builtin) return Tiny.error(Tiny.errorFormatter(this.messages.runtimeError.identifierNotDefined_2, name), position.line, position.column)

        return builtin
    }

    private evalLiteral(literal: Tiny.LiteralExpression): Tiny.LangObject {
        switch (literal.value.kind) {
            case Tiny.LiteralKind.Number:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: literal.value.value,
                }

            case Tiny.LiteralKind.String:
                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: literal.value.value,
                }

            case Tiny.LiteralKind.Boolean:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: literal.value.value,
                }

            default:
                return NULL
        }
    }

    private evalPrefix(operator: Tiny.TokenType, right: Tiny.Expression, enviroment: Tiny.Enviroment, position: Tiny.Position): Tiny.LangObject {
        const expression = this.evalExpression(right, enviroment)
        if (expression?.kind === Tiny.ObjectKind.ERROR) return expression

        switch (operator) {
            case Tiny.TokenType.MINUS:
                return this.evalMinus(expression, position)

            case Tiny.TokenType.BANG:
                return this.evalBang(expression)

            default:
                return NULL
        }
    }

    private evalInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.Expression,
        rightOperand: Tiny.Expression,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position
    ): Tiny.LangObject {
        const left = this.evalExpression(leftOperand, enviroment)
        if (left?.kind === Tiny.ObjectKind.ERROR) return left

        const right = this.evalExpression(rightOperand, enviroment)
        if (right?.kind === Tiny.ObjectKind.ERROR) return right

        if (operator === Tiny.TokenType.NULLISH) return left?.kind === Tiny.ObjectKind.NULL ? right : left

        switch (left?.kind) {
            case Tiny.ObjectKind.NUMBER:
                return this.evalNumberInfix(operator, left, right, position)

            case Tiny.ObjectKind.STRING:
                return this.evalStringInfix(operator, left, right, position)

            case Tiny.ObjectKind.BOOLEAN:
                return this.evalBooleanInfix(operator, left, right, position)

            case Tiny.ObjectKind.OBJECT:
                return this.evalObjectInfix(operator, left, right, position)

            case Tiny.ObjectKind.ARRAY:
                return this.evalArrayInfix(operator, left, right, position)

            default:
                return Tiny.error(
                    Tiny.errorFormatter(this.messages.runtimeError.typeMismatch_2, left?.kind, right?.kind),
                    position.line,
                    position.column
                )
        }
    }

    private typeMissmatch(left: Tiny.LangObject, right: Tiny.LangObject, position: Tiny.Position): Tiny.LangObject {
        return Tiny.error(
            Tiny.errorFormatter(
                this.messages.runtimeError.typeMismatch_2,
                Tiny.objectKindStringify(left?.kind ?? Tiny.ObjectKind.NULL),
                Tiny.objectKindStringify(right?.kind ?? Tiny.ObjectKind.NULL)
            ),
            position.line,
            position.column
        )
    }

    private evalNumberInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN) return this.evalInOperator(leftOperand, rightOperand, position)

        if (leftOperand?.kind !== Tiny.ObjectKind.NUMBER || rightOperand?.kind !== Tiny.ObjectKind.NUMBER)
            return this.typeMissmatch(leftOperand, rightOperand, position)

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value + rightOperand.value,
                }

            case Tiny.TokenType.MINUS:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value - rightOperand.value,
                }

            case Tiny.TokenType.SLASH:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value / rightOperand.value,
                }

            case Tiny.TokenType.ASTERISK:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value * rightOperand.value,
                }

            case Tiny.TokenType.PERCENT:
                return {
                    kind: Tiny.ObjectKind.NUMBER,
                    value: leftOperand.value % rightOperand.value,
                }

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                }

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                }

            case Tiny.TokenType.GT:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value > rightOperand.value,
                }

            case Tiny.TokenType.LT:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value < rightOperand.value,
                }

            case Tiny.TokenType.GTE:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value >= rightOperand.value,
                }

            case Tiny.TokenType.LTE:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value <= rightOperand.value,
                }

            default:
                return null
        }
    }

    private evalBooleanInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN) return this.evalInOperator(leftOperand, rightOperand, position)

        if (leftOperand?.kind !== Tiny.ObjectKind.BOOLEAN || rightOperand?.kind !== Tiny.ObjectKind.BOOLEAN)
            return this.typeMissmatch(leftOperand, rightOperand, position)

        switch (operator) {
            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                }

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                }

            case Tiny.TokenType.AND:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value && rightOperand.value,
                }

            case Tiny.TokenType.OR:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value || rightOperand.value,
                }

            default:
                return null
        }
    }

    private evalStringInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        if (operator === Tiny.TokenType.IN) return this.evalInOperator(leftOperand, rightOperand, position)

        if (leftOperand?.kind !== Tiny.ObjectKind.STRING || rightOperand?.kind !== Tiny.ObjectKind.STRING)
            return this.typeMissmatch(leftOperand, rightOperand, position)

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.STRING,
                    value: `${leftOperand.value}${rightOperand.value}`,
                }

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                }

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                }

            default:
                return null
        }
    }

    private evalObjectInfix(
        operator: Tiny.TokenType,
        leftOperand: Tiny.LangObject,
        rightOperand: Tiny.LangObject,
        position: Tiny.Position
    ): Tiny.LangObject {
        switch (operator) {
            case Tiny.TokenType.IN:
                return this.evalInOperator(leftOperand, rightOperand, position)
        }

        if (leftOperand?.kind !== Tiny.ObjectKind.OBJECT || rightOperand?.kind !== Tiny.ObjectKind.OBJECT)
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Tiny.objectKindStringify(leftOperand?.kind ?? Tiny.ObjectKind.NULL),
                    Tiny.objectKindStringify(rightOperand?.kind ?? Tiny.ObjectKind.NULL)
                ),
                position.line,
                position.column
            )

        switch (operator) {
            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.pairs) === JSON.stringify(rightOperand.pairs),
                }

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.pairs) !== JSON.stringify(rightOperand.pairs),
                }

            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.OBJECT,
                    pairs: new Map([
                        ...[...leftOperand.pairs.entries()].filter(
                            ([k]) => !new Map([...rightOperand.pairs.entries()].map(([k, v]) => [JSON.stringify(k), v])).has(JSON.stringify(k))
                        ),
                        ...rightOperand.pairs,
                    ]),
                }

            default:
                return null
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
                return this.evalInOperator(leftOperand, rightOperand, position)
        }

        if (leftOperand?.kind !== Tiny.ObjectKind.ARRAY || rightOperand?.kind !== Tiny.ObjectKind.ARRAY)
            return Tiny.error(
                Tiny.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Tiny.objectKindStringify(leftOperand?.kind ?? Tiny.ObjectKind.NULL),
                    Tiny.objectKindStringify(rightOperand?.kind ?? Tiny.ObjectKind.NULL)
                ),
                position.line,
                position.column
            )

        switch (operator) {
            case Tiny.TokenType.PLUS:
                return {
                    kind: Tiny.ObjectKind.ARRAY,
                    value: [...leftOperand.value, ...rightOperand.value],
                }

            case Tiny.TokenType.EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.value) === JSON.stringify(rightOperand.value),
                }

            case Tiny.TokenType.NOT_EQUAL:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.value) !== JSON.stringify(rightOperand.value),
                }

            default:
                return null
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
            const right = this.evalExpression(rightOperand, enviroment)
            if (right?.kind === Tiny.ObjectKind.ERROR) return right

            if (leftOperand?.kind !== Tiny.ExpressionKind.Ident && leftOperand?.kind !== Tiny.ExpressionKind.Index)
                return Tiny.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

            switch (leftOperand.kind) {
                case Tiny.ExpressionKind.Ident: {
                    if (!enviroment.get((leftOperand as unknown as Tiny.StringLiteral).value))
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError.identifierNotDefined_1,
                                (leftOperand as unknown as Tiny.StringLiteral).value
                            ),
                            position.line,
                            position.column
                        )

                    enviroment.update((leftOperand as unknown as Tiny.StringLiteral).value, right)

                    return right
                }

                case Tiny.ExpressionKind.Index: {
                    const index = (leftOperand as unknown as Tiny.IndexExpression).index

                    const left = this.evalExpression((leftOperand as unknown as Tiny.IndexExpression).left, enviroment)
                    if (left?.kind === Tiny.ObjectKind.ERROR) return left

                    if (left?.kind !== Tiny.ObjectKind.ARRAY && left?.kind !== Tiny.ObjectKind.OBJECT)
                        return Tiny.error(
                            Tiny.errorFormatter(
                                this.messages.runtimeError.typeMismatch_2,
                                Tiny.objectKindStringify(left?.kind ?? Tiny.ObjectKind.NULL),
                                Tiny.objectKindStringify(Tiny.ObjectKind.ARRAY)
                            ),
                            position.line,
                            position.column
                        )

                    if (left?.kind === Tiny.ObjectKind.ARRAY) {
                        const resultIdx = this.evalExpression(index, enviroment)
                        if (resultIdx?.kind === Tiny.ObjectKind.ERROR) return resultIdx

                        if (resultIdx?.kind !== Tiny.ObjectKind.NUMBER)
                            return Tiny.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

                        const value = this.evalExpression(rightOperand, enviroment)
                        if (value?.kind === Tiny.ObjectKind.ERROR) return value

                        if (value?.kind !== Tiny.ObjectKind.NUMBER)
                            return Tiny.error(this.messages.runtimeError.typeMismatch_2, position.line, position.column)

                        left.value[resultIdx.value] = value

                        return value
                    } else {
                        const resultIdx = this.evalExpression(index, enviroment)
                        if (resultIdx?.kind === Tiny.ObjectKind.ERROR) return resultIdx

                        if (resultIdx?.kind !== Tiny.ObjectKind.STRING && resultIdx?.kind !== Tiny.ObjectKind.NUMBER)
                            return Tiny.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

                        const value = this.evalExpression(rightOperand, enviroment)
                        if (value?.kind === Tiny.ObjectKind.ERROR) return value

                        left.pairs = new Map(
                            Array.from(new Map([...new Map([...left.pairs].map(([k, v]) => [k.value, v])), [resultIdx.value, value]]).entries()).map(
                                ([k, v]) => [
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
                                ]
                            )
                        )

                        return value
                    }
                }
            }
        }

        return null
    }

    private evalElementInfix(
        leftOperand: Tiny.Expression,
        rightOperand: Tiny.Expression,
        enviroment: Tiny.Enviroment,
        position: Tiny.Position
    ): Tiny.LangObject {
        const left = this.evalExpression(leftOperand, enviroment)
        if (left?.kind === Tiny.ObjectKind.ERROR) return left

        if (left?.kind !== Tiny.ObjectKind.OBJECT && left?.kind !== Tiny.ObjectKind.ARRAY) return null

        let right: Tiny.LangObject | Tiny.CallExpression = null

        if (rightOperand?.kind === Tiny.ExpressionKind.Ident)
            right = {
                kind: Tiny.ObjectKind.STRING,
                value: rightOperand.value,
            }
        else if (rightOperand?.kind === Tiny.ExpressionKind.Call) right = rightOperand
        else right = this.evalExpression(rightOperand, enviroment)

        if (right?.kind === Tiny.ObjectKind.ERROR) return right

        if (left.kind === Tiny.ObjectKind.ARRAY)
            if (right?.kind === Tiny.ObjectKind.NUMBER) return this.evalIndex(left, right, position)
            else NULL

        if (right?.kind === Tiny.ObjectKind.NUMBER || right?.kind === Tiny.ObjectKind.STRING) {
            return new Map([...(left as Tiny.ObjectObject).pairs].map(([key, value]) => [key.value, value])).get(right.value) ?? UNDEFINED
        } else if (right?.kind === Tiny.ExpressionKind.Call) {
            const expression =
                new Map([...(left as Tiny.ObjectObject).pairs].map(([key, value]) => [key.value, value])).get(
                    (right.function as unknown as Tiny.StringLiteral).value
                ) ?? UNDEFINED

            if (expression?.kind === Tiny.ObjectKind.ERROR) return expression

            if (expression?.kind !== Tiny.ObjectKind.FUNCTION)
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.invalidFunction,
                        (right.function as unknown as Tiny.StringLiteral).value ?? '<unknown>'
                    ),
                    position.line,
                    position.column
                )

            const callResult = this.evalCallExpression(
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
            )

            if (callResult?.kind === Tiny.ObjectKind.ERROR) return callResult

            return callResult
        } else return NULL
    }

    private evalInOperator(leftOperand: Tiny.LangObject, rightOperand: Tiny.LangObject, position: Tiny.Position): Tiny.LangObject {
        switch (rightOperand?.kind) {
            case Tiny.ObjectKind.ARRAY:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: rightOperand.value.map((x) => JSON.stringify(x)).includes(JSON.stringify(leftOperand)),
                }

            case Tiny.ObjectKind.OBJECT: {
                if (leftOperand?.kind === Tiny.ObjectKind.STRING || leftOperand?.kind === Tiny.ObjectKind.NUMBER)
                    return {
                        kind: Tiny.ObjectKind.BOOLEAN,
                        value: [...rightOperand.pairs.keys()].map((x) => JSON.stringify(x)).includes(JSON.stringify(leftOperand)),
                    }
                else return this.typeMissmatch(leftOperand, rightOperand, position)
            }

            case Tiny.ObjectKind.STRING:
                return {
                    kind: Tiny.ObjectKind.BOOLEAN,
                    value: rightOperand.value.includes((leftOperand as Tiny.StringObject).value),
                }

            case Tiny.ObjectKind.NUMBER:
                if (leftOperand?.kind === Tiny.ObjectKind.OBJECT)
                    return {
                        kind: Tiny.ObjectKind.BOOLEAN,
                        value: [...leftOperand.pairs.values()].map((x) => JSON.stringify(x)).includes(JSON.stringify(rightOperand)),
                    }
                else return this.typeMissmatch(leftOperand, rightOperand, position)

            default:
                return Tiny.error(
                    Tiny.errorFormatter(
                        this.messages.runtimeError.typeMismatch_2,
                        Tiny.objectKindStringify(leftOperand?.kind ?? Tiny.ObjectKind.NULL),
                        Tiny.objectKindStringify(rightOperand?.kind ?? Tiny.ObjectKind.NULL)
                    ),
                    position.line,
                    position.column
                )
        }
    }

    private evalIfExpression(
        condition: Tiny.Expression,
        consequence: Tiny.Expression,
        alternative: Tiny.Expression,
        enviroment: Tiny.Enviroment
    ): Tiny.LangObject {
        const conditionExpression = this.evalExpression(condition, enviroment)
        if (conditionExpression?.kind === Tiny.ObjectKind.ERROR) return conditionExpression

        if (this.isTruthy(conditionExpression)) {
            const consequenceResult = this.evalExpression(consequence, enviroment)
            if (consequenceResult?.kind === Tiny.ObjectKind.ERROR) return consequenceResult

            return consequenceResult
        } else if (alternative) {
            const alternativeResult = this.evalExpression(alternative, enviroment)
            if (alternativeResult?.kind === Tiny.ObjectKind.ERROR) return alternativeResult

            return alternativeResult
        } else return NULL
    }

    private evalIndex(left: Tiny.LangObject, index: Tiny.LangObject, position: Tiny.Position): Tiny.LangObject {
        switch (left?.kind) {
            case Tiny.ObjectKind.ARRAY: {
                if (index?.kind === Tiny.ObjectKind.NUMBER) return this.evalArrayIndex(left, index, position)

                return Tiny.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)
            }

            case Tiny.ObjectKind.OBJECT: {
                let key: string | number

                switch (index?.kind) {
                    case Tiny.ObjectKind.STRING:
                    case Tiny.ObjectKind.NUMBER:
                        key = index.value
                        break

                    default:
                        return Tiny.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)
                }

                return new Map([...left.pairs].map(([key, value]) => [key.value, value])).get(key) ?? UNDEFINED
            }

            default:
                return NULL
        }
    }

    private evalArrayIndex(left: Tiny.LangObject, index: Tiny.LangObject, position: Tiny.Position): Tiny.LangObject {
        if (index?.kind !== Tiny.ObjectKind.NUMBER || left?.kind !== Tiny.ObjectKind.ARRAY)
            return Tiny.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

        if (index.value < 0 || index.value >= left.value.length)
            return Tiny.error(this.messages.runtimeError.indexOutOfRange, position.line, position.column)

        return left.value[index.value]
    }

    private isTruthy(object: Tiny.LangObject): boolean {
        if (!object) return false

        switch (object.kind) {
            case Tiny.ObjectKind.BOOLEAN:
                return object.value

            case Tiny.ObjectKind.NUMBER:
                return object.value !== 0

            case Tiny.ObjectKind.NULL:
            case Tiny.ObjectKind.UNDEFINED:
                return false

            default:
                return true
        }
    }

    private evalBang(object: Tiny.LangObject): Tiny.LangObject {
        return {
            kind: Tiny.ObjectKind.BOOLEAN,
            value: !this.isTruthy(object),
        }
    }

    private evalMinus(object: Tiny.LangObject, position: Tiny.Position): Tiny.LangObject {
        if (object?.kind !== Tiny.ObjectKind.NUMBER) return Tiny.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

        return {
            kind: Tiny.ObjectKind.NUMBER,
            value: -object.value,
        }
    }
}
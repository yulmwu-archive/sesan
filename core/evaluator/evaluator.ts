import { readFileSync } from 'node:fs'
import * as Sesan from '../../index'

export const NULL: Sesan.LangObject = { kind: Sesan.ObjectKind.NULL }
export const UNDEFINED: Sesan.LangObject = { kind: Sesan.ObjectKind.UNDEFINED }

export interface EvaluatorOptions extends Sesan.Options {
    stdio: Record<'stdin' | 'stdout' | 'stderr', Sesan.Stdio>
    filename: string
    root: string
}

export default class Evaluator {
    public messages: Sesan.Errors

    constructor(public program: Sesan.Program, public enviroment: Sesan.Enviroment, public option: EvaluatorOptions) {
        this.messages = Sesan.localization(option)
    }

    public eval(): Sesan.LangObject {
        if (this.program.errors.length > 0) return null

        const result = this.evalStatements(this.program.statements, this.enviroment)

        if (result?.kind === Sesan.ObjectKind.ERROR) {
            Sesan.printError(result, this.option.filename, this.option.stdio.stderr, this.option)

            return null
        }

        return result
    }

    private evalStatements(statements: Array<Sesan.Statement>, enviroment: Sesan.Enviroment): Sesan.LangObject {
        let results: Array<Sesan.LangObject> = []

        for (const statement of statements) {
            const result = this.evalStatement(statement, enviroment)

            results.push(result)

            if (result) {
                if (result.kind === Sesan.ObjectKind.RETURN_VALUE) return result.value
                if (result.kind === Sesan.ObjectKind.ERROR) return result
            }
        }

        if (results.length === 0) return UNDEFINED

        return results[results.length - 1]
    }

    private evalBlockStatements(statement: Sesan.BlockStatement, enviroment: Sesan.Enviroment): Sesan.LangObject {
        const { statements, returnFinal } = statement

        let results: Array<Sesan.LangObject> = []

        for (const statement of statements) {
            const result = this.evalStatement(statement, enviroment)

            results.push(result)

            if (result) {
                if (result.kind === Sesan.ObjectKind.RETURN_VALUE) return result
                if (result.kind === Sesan.ObjectKind.ERROR) return result
            }
        }

        if (results.length === 0) return UNDEFINED

        if (returnFinal) return results[results.length - 1]
        else return UNDEFINED
    }

    private evalStatement(statement: Sesan.Statement, enviroment: Sesan.Enviroment): Sesan.LangObject {
        switch (statement.kind) {
            case Sesan.NodeKind.ExpressionStatement:
                return this.evalExpression(statement.expression, enviroment)

            case Sesan.NodeKind.LetStatement: {
                const value = this.evalExpression(statement.value, enviroment)
                if (value?.kind === Sesan.ObjectKind.ERROR) return value

                const name = (statement.ident as unknown as Sesan.StringLiteral).value

                if (statement.ident && name !== '_') enviroment.set(name, value)

                return null
            }

            case Sesan.NodeKind.ReturnStatement: {
                const expression = this.evalExpression((statement as unknown as Sesan.ReturnStatement).value, enviroment)

                if (expression)
                    return {
                        value: expression,
                        kind: Sesan.ObjectKind.RETURN_VALUE,
                    }

                return NULL
            }

            case Sesan.NodeKind.WhileStatement: {
                let condition = this.evalExpression((statement as unknown as Sesan.WhileStatement).condition, enviroment)
                if (condition?.kind === Sesan.ObjectKind.ERROR) return condition

                const resultExpr: Array<Sesan.LangObject> = []

                while (this.isTruthy(condition)) {
                    const result = this.evalExpression((statement as unknown as Sesan.WhileStatement).body, enviroment)
                    if (result?.kind === Sesan.ObjectKind.ERROR) return result

                    condition = this.evalExpression((statement as unknown as Sesan.WhileStatement).condition, enviroment)

                    if (condition?.kind === Sesan.ObjectKind.ERROR) return condition

                    resultExpr.push(result)
                }

                return NULL
            }

            case Sesan.NodeKind.DecoratorStatement: {
                const decorator = statement as unknown as Sesan.DecoratorStatement

                const value = this.evalExpression(decorator.value, enviroment)
                if (value?.kind === Sesan.ObjectKind.ERROR) return value

                const func = this.evalFunction(decorator.function as Sesan.FunctionExpression, enviroment, value)

                if (func?.kind !== Sesan.ObjectKind.FUNCTION) return null

                return func
            }

            default:
                return NULL
        }
    }

    private evalExpression(expression: Sesan.Expression, enviroment: Sesan.Enviroment): Sesan.LangObject {
        if (!expression) return null

        switch (expression.kind) {
            case Sesan.ExpressionKind.Literal:
                return this.evalLiteral(expression as Sesan.LiteralExpression)

            case Sesan.ExpressionKind.Prefix: {
                return this.evalPrefix(expression.operator, expression.right, enviroment, {
                    line: expression.line,
                    column: expression.column,
                })
            }

            case Sesan.ExpressionKind.Infix:
                const infix = expression as unknown as Sesan.InfixExpression

                switch (infix.operator) {
                    case Sesan.TokenType.ASSIGN:
                        return this.evalIdentInfix(infix.operator, infix.left, infix.right, enviroment, {
                            line: infix.line,
                            column: infix.column,
                        })

                    case Sesan.TokenType.ELEMENT:
                        return this.evalElementInfix(infix.left, infix.right, enviroment, {
                            line: infix.line,
                            column: infix.column,
                        })
                }

                return this.evalInfix(infix.operator, infix.left, infix.right, enviroment, {
                    line: infix.line,
                    column: infix.column,
                })

            case Sesan.ExpressionKind.Block:
                return this.evalBlockStatements(expression as unknown as Sesan.BlockStatement, enviroment)

            case Sesan.ExpressionKind.If: {
                return this.evalIfExpression(expression.condition, expression.consequence, expression.alternative, enviroment)
            }

            case Sesan.ExpressionKind.Ident:
                return this.evalIdent((expression as unknown as Sesan.StringLiteral).value, enviroment, {
                    line: expression.line,
                    column: expression.column,
                })

            case Sesan.ExpressionKind.Function:
                return this.evalFunction(expression as unknown as Sesan.FunctionExpression, enviroment)

            case Sesan.ExpressionKind.Call:
                return this.evalCallExpression(expression as unknown as Sesan.CallExpression, enviroment)

            case Sesan.ExpressionKind.Array: {
                const args = this.evalExpressions(expression.elements, enviroment)

                if (args.length == 1 && args[0]?.kind === Sesan.ObjectKind.ERROR) return args[0]

                return {
                    value: args,
                    kind: Sesan.ObjectKind.ARRAY,
                }
            }

            case Sesan.ExpressionKind.Index: {
                const resultExpr = this.evalExpression(expression.left, enviroment)
                if (!resultExpr) return null

                if (resultExpr.kind === Sesan.ObjectKind.ERROR) return NULL

                const index = this.evalExpression(expression.index, enviroment)
                if (!index) return null

                if (index.kind === Sesan.ObjectKind.ERROR) return NULL

                return this.evalIndex(resultExpr, index, {
                    line: expression.line,
                    column: expression.column,
                })
            }

            case Sesan.ExpressionKind.Object:
                return this.evalObjectParameters((expression as unknown as Sesan.ObjectExpression).pairs, enviroment)

            case Sesan.ExpressionKind.Typeof: {
                const value = this.evalExpression(expression.value, enviroment)
                if (value?.kind === Sesan.ObjectKind.ERROR) return value

                if (!value) return NULL

                return {
                    kind: Sesan.ObjectKind.STRING,
                    value: Sesan.objectKindStringify(value.kind),
                }
            }

            case Sesan.ExpressionKind.Throw: {
                const message = this.evalExpression(expression.message, enviroment)
                if (message?.kind === Sesan.ObjectKind.ERROR) return message

                if (!message) return NULL

                return Sesan.error(Sesan.objectStringify(message), expression.line, expression.column)
            }

            case Sesan.ExpressionKind.Delete: {
                if (expression.value?.kind !== Sesan.ExpressionKind.Ident)
                    return Sesan.error(this.messages.runtimeError.deleteRequiresIdentifier, expression.line, expression.column)

                enviroment.delete((expression.value as unknown as Sesan.StringLiteral).value)

                return NULL
            }

            case Sesan.ExpressionKind.Use: {
                const path = this.evalExpression(expression.path, enviroment)
                if (path?.kind === Sesan.ObjectKind.ERROR) return path

                if (path?.kind !== Sesan.ObjectKind.STRING)
                    return Sesan.error(this.messages.runtimeError.useRequiresString, expression.line, expression.column)

                return this.importEnv((path as unknown as Sesan.StringObject).value, enviroment, this, {
                    line: expression.line,
                    column: expression.column,
                })
            }

            case Sesan.ExpressionKind.Void: {
                const value = this.evalExpression(expression.value, enviroment)
                if (value?.kind === Sesan.ObjectKind.ERROR) return value

                return UNDEFINED
            }

            case Sesan.ExpressionKind.Expr: {
                const value = this.evalExpression(expression.value, enviroment)

                if (value?.kind === Sesan.ObjectKind.ERROR)
                    return {
                        kind: Sesan.ObjectKind.OBJECT,
                        pairs: new Map([
                            [
                                {
                                    kind: Sesan.ObjectKind.STRING,
                                    value: 'message',
                                },
                                {
                                    kind: Sesan.ObjectKind.STRING,
                                    value: value.message,
                                },
                            ],
                            [
                                {
                                    kind: Sesan.ObjectKind.STRING,
                                    value: 'line',
                                },
                                {
                                    kind: Sesan.ObjectKind.NUMBER,
                                    value: value.line,
                                },
                            ],
                            [
                                {
                                    kind: Sesan.ObjectKind.STRING,
                                    value: 'column',
                                },
                                {
                                    kind: Sesan.ObjectKind.NUMBER,
                                    value: value.column,
                                },
                            ],
                            [
                                {
                                    kind: Sesan.ObjectKind.STRING,
                                    value: 'filename',
                                },
                                {
                                    kind: Sesan.ObjectKind.STRING,
                                    value: this.option.filename,
                                },
                            ],
                            [
                                {
                                    kind: Sesan.ObjectKind.STRING,
                                    value: 'error',
                                },
                                {
                                    kind: Sesan.ObjectKind.BOOLEAN,
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

    public importEnv(path: string, enviroment: Sesan.Enviroment, evaluator: Evaluator, position: Sesan.Position): Sesan.LangObject {
        try {
            if (!path.endsWith('.sesan')) path += '.sesan'

            const parsed = new Sesan.Parser(
                new Sesan.Lexer(
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
                Sesan.printError(error, path, evaluator.option.stdio.stderr, {
                    ...evaluator.option,
                })
            )

            return new Sesan.Evaluator(parsed, enviroment, {
                ...evaluator.option,
                filename: path,
            }).eval()
        } catch (e) {
            return {
                kind: Sesan.ObjectKind.ERROR,
                message: `Could not import file: ${evaluator.option.root}${path}`,
                ...position,
            }
        }
    }

    private evalFunction(expression: Sesan.FunctionExpression, enviroment: Sesan.Enviroment, decorator?: Sesan.LangObject): Sesan.LangObject {
        const functionObject: Sesan.LangObject = {
            function: expression.function ?? null,
            parameters: expression.parameters,
            body: expression.body,
            enviroment: enviroment,
            option: this.option,
            decorator: decorator as Sesan.ObjectObject,
            kind: Sesan.ObjectKind.FUNCTION,
        }

        const name = functionObject.function ? (functionObject.function as unknown as Sesan.StringLiteral).value ?? null : null

        if (expression.function && name && name !== '_') enviroment.set(name, functionObject)

        return functionObject
    }

    private evalCallExpression(expression: Sesan.CallExpression, enviroment: Sesan.Enviroment): Sesan.LangObject {
        const functionObject = this.evalExpression(expression.function, enviroment)
        if (functionObject?.kind === Sesan.ObjectKind.ERROR) return functionObject

        const args = this.evalExpressions(expression.parameters, enviroment)

        if (args.length == 1 && args[0]?.kind === Sesan.ObjectKind.ERROR) return args[0]

        return this.applyFunction(
            functionObject as Sesan.FunctionObject,
            (expression.function as unknown as Sesan.StringLiteral).value,
            args,
            enviroment,
            { line: expression.line, column: expression.column },
            {
                kind: Sesan.ObjectKind.OBJECT,
                pairs: new Map<Sesan.StringObject | Sesan.NumberObject, Sesan.LangObject>([
                    [
                        { kind: Sesan.ObjectKind.STRING, value: 'arguments' },
                        { kind: Sesan.ObjectKind.ARRAY, value: args },
                    ],
                    [{ kind: Sesan.ObjectKind.STRING, value: 'decorator' }, (functionObject as Sesan.FunctionObject).decorator ?? NULL],
                ]),
            }
        )
    }

    private evalObjectParameters(parameters: Array<Sesan.ObjectPair>, enviroment: Sesan.Enviroment): Sesan.ObjectObject {
        const object: Sesan.ObjectObject = {
            kind: Sesan.ObjectKind.OBJECT,
            pairs: new Map(),
        }

        parameters.forEach((arg: Sesan.ObjectPair) => {
            const key = this.evalExpression(arg.key, enviroment)
            if (!key) return

            if (key.kind === Sesan.ObjectKind.ERROR) return key

            const value = this.evalExpression(arg.value, enviroment)
            if (!value) return

            if (value.kind === Sesan.ObjectKind.ERROR) return key

            if (key.kind !== Sesan.ObjectKind.STRING && key.kind !== Sesan.ObjectKind.NUMBER) return

            if (key) object.pairs.set(key, value)
        })

        return object
    }

    private evalExpressions(expression: Array<Sesan.Expression>, enviroment: Sesan.Enviroment): Array<Sesan.LangObject> {
        return expression.map((expression: Sesan.Expression) => this.evalExpression(expression, enviroment))
    }

    private getDecorator(key: string | number, func: Sesan.FunctionObject): Sesan.LangObject | null {
        if (!func.decorator) return null

        return new Map([...func.decorator.pairs].map(([key, value]) => [key.value, value])).get(key) ?? NULL
    }

    public applyFunction(
        functionObject: Sesan.FunctionObject,
        callName: string,
        parameters: Array<Sesan.LangObject>,
        enviroment: Sesan.Enviroment,
        position: Sesan.Position,
        thisObject: Sesan.LangObject
    ): Sesan.LangObject {
        console.log(functionObject.function, callName)
        if (functionObject?.kind === Sesan.ObjectKind.FUNCTION) {
            if (!this.getDecorator('skipCheckArguments', functionObject) && functionObject.parameters.length !== parameters.length)
                return Sesan.error(
                    Sesan.errorFormatter(
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
                    (this.getDecorator('noCapture', functionObject) as Sesan.BooleanObject)?.value ?? false
                )
            )

            if (result?.kind === Sesan.ObjectKind.RETURN_VALUE) return result.value
            if (result?.kind === Sesan.ObjectKind.ERROR) return result

            return result
        }

        if (functionObject?.kind === Sesan.ObjectKind.BUILTIN)
            return (functionObject as unknown as Sesan.BuiltinFunction).func(parameters, enviroment, this, position)

        return Sesan.error(Sesan.errorFormatter(this.messages.runtimeError.invalidFunction, callName ?? '<unknown>'), position.line, position.column)
    }

    private extendFunctionEnv(
        functionObject: Sesan.LangObject,
        parameters: Array<Sesan.LangObject>,
        enviroment: Sesan.Enviroment,
        thisObject: Sesan.LangObject,
        noCapture: boolean
    ): Sesan.Enviroment {
        if (functionObject?.kind === Sesan.ObjectKind.FUNCTION) {
            let extendEnviroment = new Sesan.Enviroment(enviroment)

            if (!noCapture) extendEnviroment.outer = functionObject.enviroment

            functionObject.parameters.forEach((param: Sesan.Expression, i: number) => {
                if (param?.kind === Sesan.ExpressionKind.Ident) extendEnviroment.set((param as unknown as Sesan.StringLiteral).value, parameters[i])
            })

            extendEnviroment.set('this', thisObject)

            return extendEnviroment
        }

        return new Sesan.Enviroment()
    }

    private evalIdent(name: string, enviroment: Sesan.Enviroment, position: Sesan.Position): Sesan.LangObject {
        if (enviroment.get(name)) return enviroment.get(name)

        const builtin = Sesan.builtinFunction(name)

        if (!builtin)
            return Sesan.error(Sesan.errorFormatter(this.messages.runtimeError.identifierNotDefined_2, name), position.line, position.column)

        return builtin
    }

    private evalLiteral(literal: Sesan.LiteralExpression): Sesan.LangObject {
        switch (literal.value.kind) {
            case Sesan.LiteralKind.Number:
                return {
                    kind: Sesan.ObjectKind.NUMBER,
                    value: literal.value.value,
                }

            case Sesan.LiteralKind.String:
                return {
                    kind: Sesan.ObjectKind.STRING,
                    value: literal.value.value,
                }

            case Sesan.LiteralKind.Boolean:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: literal.value.value,
                }

            default:
                return NULL
        }
    }

    private evalPrefix(operator: Sesan.TokenType, right: Sesan.Expression, enviroment: Sesan.Enviroment, position: Sesan.Position): Sesan.LangObject {
        const expression = this.evalExpression(right, enviroment)
        if (expression?.kind === Sesan.ObjectKind.ERROR) return expression

        switch (operator) {
            case Sesan.TokenType.MINUS:
                return this.evalMinus(expression, position)

            case Sesan.TokenType.BANG:
                return this.evalBang(expression)

            default:
                return NULL
        }
    }

    private evalInfix(
        operator: Sesan.TokenType,
        leftOperand: Sesan.Expression,
        rightOperand: Sesan.Expression,
        enviroment: Sesan.Enviroment,
        position: Sesan.Position
    ): Sesan.LangObject {
        const left = this.evalExpression(leftOperand, enviroment)
        if (left?.kind === Sesan.ObjectKind.ERROR) return left

        const right = this.evalExpression(rightOperand, enviroment)
        if (right?.kind === Sesan.ObjectKind.ERROR) return right

        if (operator === Sesan.TokenType.NULLISH) return left?.kind === Sesan.ObjectKind.NULL ? right : left

        switch (left?.kind) {
            case Sesan.ObjectKind.NUMBER:
                return this.evalNumberInfix(operator, left, right, position)

            case Sesan.ObjectKind.STRING:
                return this.evalStringInfix(operator, left, right, position)

            case Sesan.ObjectKind.BOOLEAN:
                return this.evalBooleanInfix(operator, left, right, position)

            case Sesan.ObjectKind.OBJECT:
                return this.evalObjectInfix(operator, left, right, position)

            case Sesan.ObjectKind.ARRAY:
                return this.evalArrayInfix(operator, left, right, position)

            default:
                return Sesan.error(
                    Sesan.errorFormatter(this.messages.runtimeError.typeMismatch_2, left?.kind, right?.kind),
                    position.line,
                    position.column
                )
        }
    }

    private typeMissmatch(left: Sesan.LangObject, right: Sesan.LangObject, position: Sesan.Position): Sesan.LangObject {
        return Sesan.error(
            Sesan.errorFormatter(
                this.messages.runtimeError.typeMismatch_2,
                Sesan.objectKindStringify(left?.kind ?? Sesan.ObjectKind.NULL),
                Sesan.objectKindStringify(right?.kind ?? Sesan.ObjectKind.NULL)
            ),
            position.line,
            position.column
        )
    }

    private evalNumberInfix(
        operator: Sesan.TokenType,
        leftOperand: Sesan.LangObject,
        rightOperand: Sesan.LangObject,
        position: Sesan.Position
    ): Sesan.LangObject {
        if (operator === Sesan.TokenType.IN) return this.evalInOperator(leftOperand, rightOperand, position)

        if (leftOperand?.kind !== Sesan.ObjectKind.NUMBER || rightOperand?.kind !== Sesan.ObjectKind.NUMBER)
            return this.typeMissmatch(leftOperand, rightOperand, position)

        switch (operator) {
            case Sesan.TokenType.PLUS:
                return {
                    kind: Sesan.ObjectKind.NUMBER,
                    value: leftOperand.value + rightOperand.value,
                }

            case Sesan.TokenType.MINUS:
                return {
                    kind: Sesan.ObjectKind.NUMBER,
                    value: leftOperand.value - rightOperand.value,
                }

            case Sesan.TokenType.SLASH:
                return {
                    kind: Sesan.ObjectKind.NUMBER,
                    value: leftOperand.value / rightOperand.value,
                }

            case Sesan.TokenType.ASTERISK:
                return {
                    kind: Sesan.ObjectKind.NUMBER,
                    value: leftOperand.value * rightOperand.value,
                }

            case Sesan.TokenType.PERCENT:
                return {
                    kind: Sesan.ObjectKind.NUMBER,
                    value: leftOperand.value % rightOperand.value,
                }

            case Sesan.TokenType.EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                }

            case Sesan.TokenType.NOT_EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                }

            case Sesan.TokenType.GT:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value > rightOperand.value,
                }

            case Sesan.TokenType.LT:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value < rightOperand.value,
                }

            case Sesan.TokenType.GTE:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value >= rightOperand.value,
                }

            case Sesan.TokenType.LTE:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value <= rightOperand.value,
                }

            default:
                return null
        }
    }

    private evalBooleanInfix(
        operator: Sesan.TokenType,
        leftOperand: Sesan.LangObject,
        rightOperand: Sesan.LangObject,
        position: Sesan.Position
    ): Sesan.LangObject {
        if (operator === Sesan.TokenType.IN) return this.evalInOperator(leftOperand, rightOperand, position)

        if (leftOperand?.kind !== Sesan.ObjectKind.BOOLEAN || rightOperand?.kind !== Sesan.ObjectKind.BOOLEAN)
            return this.typeMissmatch(leftOperand, rightOperand, position)

        switch (operator) {
            case Sesan.TokenType.EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                }

            case Sesan.TokenType.NOT_EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                }

            case Sesan.TokenType.AND:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value && rightOperand.value,
                }

            case Sesan.TokenType.OR:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value || rightOperand.value,
                }

            default:
                return null
        }
    }

    private evalStringInfix(
        operator: Sesan.TokenType,
        leftOperand: Sesan.LangObject,
        rightOperand: Sesan.LangObject,
        position: Sesan.Position
    ): Sesan.LangObject {
        if (operator === Sesan.TokenType.IN) return this.evalInOperator(leftOperand, rightOperand, position)

        if (leftOperand?.kind !== Sesan.ObjectKind.STRING || rightOperand?.kind !== Sesan.ObjectKind.STRING)
            return this.typeMissmatch(leftOperand, rightOperand, position)

        switch (operator) {
            case Sesan.TokenType.PLUS:
                return {
                    kind: Sesan.ObjectKind.STRING,
                    value: `${leftOperand.value}${rightOperand.value}`,
                }

            case Sesan.TokenType.EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value === rightOperand.value,
                }

            case Sesan.TokenType.NOT_EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: leftOperand.value !== rightOperand.value,
                }

            default:
                return null
        }
    }

    private evalObjectInfix(
        operator: Sesan.TokenType,
        leftOperand: Sesan.LangObject,
        rightOperand: Sesan.LangObject,
        position: Sesan.Position
    ): Sesan.LangObject {
        switch (operator) {
            case Sesan.TokenType.IN:
                return this.evalInOperator(leftOperand, rightOperand, position)
        }

        if (leftOperand?.kind !== Sesan.ObjectKind.OBJECT || rightOperand?.kind !== Sesan.ObjectKind.OBJECT)
            return Sesan.error(
                Sesan.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Sesan.objectKindStringify(leftOperand?.kind ?? Sesan.ObjectKind.NULL),
                    Sesan.objectKindStringify(rightOperand?.kind ?? Sesan.ObjectKind.NULL)
                ),
                position.line,
                position.column
            )

        switch (operator) {
            case Sesan.TokenType.EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.pairs) === JSON.stringify(rightOperand.pairs),
                }

            case Sesan.TokenType.NOT_EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.pairs) !== JSON.stringify(rightOperand.pairs),
                }

            case Sesan.TokenType.PLUS:
                return {
                    kind: Sesan.ObjectKind.OBJECT,
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
        operator: Sesan.TokenType,
        leftOperand: Sesan.LangObject,
        rightOperand: Sesan.LangObject,
        position: Sesan.Position
    ): Sesan.LangObject {
        switch (operator) {
            case Sesan.TokenType.IN:
                return this.evalInOperator(leftOperand, rightOperand, position)
        }

        if (leftOperand?.kind !== Sesan.ObjectKind.ARRAY || rightOperand?.kind !== Sesan.ObjectKind.ARRAY)
            return Sesan.error(
                Sesan.errorFormatter(
                    this.messages.runtimeError.typeMismatch_2,
                    Sesan.objectKindStringify(leftOperand?.kind ?? Sesan.ObjectKind.NULL),
                    Sesan.objectKindStringify(rightOperand?.kind ?? Sesan.ObjectKind.NULL)
                ),
                position.line,
                position.column
            )

        switch (operator) {
            case Sesan.TokenType.PLUS:
                return {
                    kind: Sesan.ObjectKind.ARRAY,
                    value: [...leftOperand.value, ...rightOperand.value],
                }

            case Sesan.TokenType.EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.value) === JSON.stringify(rightOperand.value),
                }

            case Sesan.TokenType.NOT_EQUAL:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: JSON.stringify(leftOperand.value) !== JSON.stringify(rightOperand.value),
                }

            default:
                return null
        }
    }

    private evalIdentInfix(
        operator: Sesan.TokenType,
        leftOperand: Sesan.Expression,
        rightOperand: Sesan.Expression,
        enviroment: Sesan.Enviroment,
        position: Sesan.Position
    ): Sesan.LangObject {
        if (operator === Sesan.TokenType.ASSIGN) {
            const right = this.evalExpression(rightOperand, enviroment)
            if (right?.kind === Sesan.ObjectKind.ERROR) return right

            if (leftOperand?.kind !== Sesan.ExpressionKind.Ident && leftOperand?.kind !== Sesan.ExpressionKind.Index)
                return Sesan.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

            switch (leftOperand.kind) {
                case Sesan.ExpressionKind.Ident: {
                    if (!enviroment.get((leftOperand as unknown as Sesan.StringLiteral).value))
                        return Sesan.error(
                            Sesan.errorFormatter(
                                this.messages.runtimeError.identifierNotDefined_1,
                                (leftOperand as unknown as Sesan.StringLiteral).value
                            ),
                            position.line,
                            position.column
                        )

                    enviroment.update((leftOperand as unknown as Sesan.StringLiteral).value, right)

                    return right
                }

                case Sesan.ExpressionKind.Index: {
                    const index = (leftOperand as unknown as Sesan.IndexExpression).index

                    const left = this.evalExpression((leftOperand as unknown as Sesan.IndexExpression).left, enviroment)
                    if (left?.kind === Sesan.ObjectKind.ERROR) return left

                    if (left?.kind !== Sesan.ObjectKind.ARRAY && left?.kind !== Sesan.ObjectKind.OBJECT)
                        return Sesan.error(
                            Sesan.errorFormatter(
                                this.messages.runtimeError.typeMismatch_2,
                                Sesan.objectKindStringify(left?.kind ?? Sesan.ObjectKind.NULL),
                                Sesan.objectKindStringify(Sesan.ObjectKind.ARRAY)
                            ),
                            position.line,
                            position.column
                        )

                    if (left?.kind === Sesan.ObjectKind.ARRAY) {
                        const resultIdx = this.evalExpression(index, enviroment)
                        if (resultIdx?.kind === Sesan.ObjectKind.ERROR) return resultIdx

                        if (resultIdx?.kind !== Sesan.ObjectKind.NUMBER)
                            return Sesan.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

                        const value = this.evalExpression(rightOperand, enviroment)
                        if (value?.kind === Sesan.ObjectKind.ERROR) return value

                        if (value?.kind !== Sesan.ObjectKind.NUMBER)
                            return Sesan.error(this.messages.runtimeError.typeMismatch_2, position.line, position.column)

                        left.value[resultIdx.value] = value

                        return value
                    } else {
                        const resultIdx = this.evalExpression(index, enviroment)
                        if (resultIdx?.kind === Sesan.ObjectKind.ERROR) return resultIdx

                        if (resultIdx?.kind !== Sesan.ObjectKind.STRING && resultIdx?.kind !== Sesan.ObjectKind.NUMBER)
                            return Sesan.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

                        const value = this.evalExpression(rightOperand, enviroment)
                        if (value?.kind === Sesan.ObjectKind.ERROR) return value

                        left.pairs = new Map(
                            Array.from(new Map([...new Map([...left.pairs].map(([k, v]) => [k.value, v])), [resultIdx.value, value]]).entries()).map(
                                ([k, v]) => [
                                    typeof k === 'string'
                                        ? {
                                              value: k,
                                              kind: Sesan.ObjectKind.STRING,
                                          }
                                        : {
                                              value: k,
                                              kind: Sesan.ObjectKind.NUMBER,
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
        leftOperand: Sesan.Expression,
        rightOperand: Sesan.Expression,
        enviroment: Sesan.Enviroment,
        position: Sesan.Position
    ): Sesan.LangObject {
        const left = this.evalExpression(leftOperand, enviroment)
        if (left?.kind === Sesan.ObjectKind.ERROR) return left

        if (left?.kind !== Sesan.ObjectKind.OBJECT && left?.kind !== Sesan.ObjectKind.ARRAY) return null

        let right: Sesan.LangObject | Sesan.CallExpression = null

        if (rightOperand?.kind === Sesan.ExpressionKind.Ident)
            right = {
                kind: Sesan.ObjectKind.STRING,
                value: rightOperand.value,
            }
        else if (rightOperand?.kind === Sesan.ExpressionKind.Call) right = rightOperand
        else right = this.evalExpression(rightOperand, enviroment)

        if (right?.kind === Sesan.ObjectKind.ERROR) return right

        if (left.kind === Sesan.ObjectKind.ARRAY)
            if (right?.kind === Sesan.ObjectKind.NUMBER) return this.evalIndex(left, right, position)
            else NULL

        if (right?.kind === Sesan.ObjectKind.NUMBER || right?.kind === Sesan.ObjectKind.STRING) {
            return new Map([...(left as Sesan.ObjectObject).pairs].map(([key, value]) => [key.value, value])).get(right.value) ?? UNDEFINED
        } else if (right?.kind === Sesan.ExpressionKind.Call) {
            const expression =
                new Map([...(left as Sesan.ObjectObject).pairs].map(([key, value]) => [key.value, value])).get(
                    (right.function as unknown as Sesan.StringLiteral).value
                ) ?? UNDEFINED

            if (expression?.kind === Sesan.ObjectKind.ERROR) return expression

            if (expression?.kind !== Sesan.ObjectKind.FUNCTION)
                return Sesan.error(
                    Sesan.errorFormatter(
                        this.messages.runtimeError.invalidFunction,
                        (right.function as unknown as Sesan.StringLiteral).value ?? '<unknown>'
                    ),
                    position.line,
                    position.column
                )

            const callResult = this.evalCallExpression(
                {
                    kind: Sesan.ExpressionKind.Call,
                    function: {
                        kind: Sesan.ExpressionKind.Function,
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

            if (callResult?.kind === Sesan.ObjectKind.ERROR) return callResult

            return callResult
        } else return NULL
    }

    private evalInOperator(leftOperand: Sesan.LangObject, rightOperand: Sesan.LangObject, position: Sesan.Position): Sesan.LangObject {
        switch (rightOperand?.kind) {
            case Sesan.ObjectKind.ARRAY:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: rightOperand.value.map((x) => JSON.stringify(x)).includes(JSON.stringify(leftOperand)),
                }

            case Sesan.ObjectKind.OBJECT: {
                if (leftOperand?.kind === Sesan.ObjectKind.STRING || leftOperand?.kind === Sesan.ObjectKind.NUMBER)
                    return {
                        kind: Sesan.ObjectKind.BOOLEAN,
                        value: [...rightOperand.pairs.keys()].map((x) => JSON.stringify(x)).includes(JSON.stringify(leftOperand)),
                    }
                else return this.typeMissmatch(leftOperand, rightOperand, position)
            }

            case Sesan.ObjectKind.STRING:
                return {
                    kind: Sesan.ObjectKind.BOOLEAN,
                    value: rightOperand.value.includes((leftOperand as Sesan.StringObject).value),
                }

            case Sesan.ObjectKind.NUMBER:
                if (leftOperand?.kind === Sesan.ObjectKind.OBJECT)
                    return {
                        kind: Sesan.ObjectKind.BOOLEAN,
                        value: [...leftOperand.pairs.values()].map((x) => JSON.stringify(x)).includes(JSON.stringify(rightOperand)),
                    }
                else return this.typeMissmatch(leftOperand, rightOperand, position)

            default:
                return Sesan.error(
                    Sesan.errorFormatter(
                        this.messages.runtimeError.typeMismatch_2,
                        Sesan.objectKindStringify(leftOperand?.kind ?? Sesan.ObjectKind.NULL),
                        Sesan.objectKindStringify(rightOperand?.kind ?? Sesan.ObjectKind.NULL)
                    ),
                    position.line,
                    position.column
                )
        }
    }

    private evalIfExpression(
        condition: Sesan.Expression,
        consequence: Sesan.Expression,
        alternative: Sesan.Expression,
        enviroment: Sesan.Enviroment
    ): Sesan.LangObject {
        const conditionExpression = this.evalExpression(condition, enviroment)
        if (conditionExpression?.kind === Sesan.ObjectKind.ERROR) return conditionExpression

        if (this.isTruthy(conditionExpression)) {
            const consequenceResult = this.evalExpression(consequence, enviroment)
            if (consequenceResult?.kind === Sesan.ObjectKind.ERROR) return consequenceResult

            return consequenceResult
        } else if (alternative) {
            const alternativeResult = this.evalExpression(alternative, enviroment)
            if (alternativeResult?.kind === Sesan.ObjectKind.ERROR) return alternativeResult

            return alternativeResult
        } else return NULL
    }

    private evalIndex(left: Sesan.LangObject, index: Sesan.LangObject, position: Sesan.Position): Sesan.LangObject {
        switch (left?.kind) {
            case Sesan.ObjectKind.ARRAY: {
                if (index?.kind === Sesan.ObjectKind.NUMBER) return this.evalArrayIndex(left, index, position)

                return Sesan.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)
            }

            case Sesan.ObjectKind.OBJECT: {
                let key: string | number

                switch (index?.kind) {
                    case Sesan.ObjectKind.STRING:
                    case Sesan.ObjectKind.NUMBER:
                        key = index.value
                        break

                    default:
                        return Sesan.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)
                }

                return new Map([...left.pairs].map(([key, value]) => [key.value, value])).get(key) ?? UNDEFINED
            }

            default:
                return NULL
        }
    }

    private evalArrayIndex(left: Sesan.LangObject, index: Sesan.LangObject, position: Sesan.Position): Sesan.LangObject {
        if (index?.kind !== Sesan.ObjectKind.NUMBER || left?.kind !== Sesan.ObjectKind.ARRAY)
            return Sesan.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

        if (index.value < 0 || index.value >= left.value.length)
            return Sesan.error(this.messages.runtimeError.indexOutOfRange, position.line, position.column)

        return left.value[index.value]
    }

    private isTruthy(object: Sesan.LangObject): boolean {
        if (!object) return false

        switch (object.kind) {
            case Sesan.ObjectKind.BOOLEAN:
                return object.value

            case Sesan.ObjectKind.NUMBER:
                return object.value !== 0

            case Sesan.ObjectKind.NULL:
            case Sesan.ObjectKind.UNDEFINED:
                return false

            default:
                return true
        }
    }

    private evalBang(object: Sesan.LangObject): Sesan.LangObject {
        return {
            kind: Sesan.ObjectKind.BOOLEAN,
            value: !this.isTruthy(object),
        }
    }

    private evalMinus(object: Sesan.LangObject, position: Sesan.Position): Sesan.LangObject {
        if (object?.kind !== Sesan.ObjectKind.NUMBER) return Sesan.error(this.messages.runtimeError.typeMismatch_1, position.line, position.column)

        return {
            kind: Sesan.ObjectKind.NUMBER,
            value: -object.value,
        }
    }
}

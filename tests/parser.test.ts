import test, { eq } from '.';
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';

const parse = (input: string) => new Parser(new Lexer(input)).parseProgram();

test('Parser test', () => {
    const expected = {
        statements: [
            {
                debug: 'parseLetStatement>return',
                ident: {
                    debug: 'parseLetStatement>ident',
                    value: 'xxxx',
                },
                value: {
                    debug: 'parsePrefix>case>function',
                    arguments: [
                        {
                            value: 'x',
                        },
                        {
                            value: 'y',
                        },
                    ],
                    body: {
                        debug: 'parseBlockStatement>return',
                        statements: [
                            {
                                debug: 'parseReturnStatement>return',
                                value: {
                                    debug: 'parseHash>return',
                                    pairs: [
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>ident',
                                                value: 'a',
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>number',
                                                value: {
                                                    value: 1,
                                                },
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>ident',
                                                value: 'b',
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>false',
                                                value: {
                                                    value: false,
                                                },
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'c',
                                                },
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'hello',
                                                },
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'd',
                                                },
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>Lbracket',
                                                elements: [
                                                    {
                                                        debug: 'parsePrefix>case>number',
                                                        value: {
                                                            value: 1,
                                                        },
                                                    },
                                                    {
                                                        debug: 'parsePrefix>case>number',
                                                        value: {
                                                            value: 2,
                                                        },
                                                    },
                                                    {
                                                        debug: 'parsePrefix>case>number',
                                                        value: {
                                                            value: 3,
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>number',
                                                value: {
                                                    value: 10,
                                                },
                                            },
                                            value: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'ten',
                                                },
                                            },
                                        },
                                        {
                                            key: {
                                                debug: 'parsePrefix>case>string',
                                                value: {
                                                    value: 'e',
                                                },
                                            },
                                            value: {
                                                debug: 'parseHash>return',
                                                pairs: [
                                                    {
                                                        key: {
                                                            debug: 'parsePrefix>case>ident',
                                                            value: 'f',
                                                        },
                                                        value: {
                                                            debug: 'parsePrefix>case>Lbracket',
                                                            elements: [
                                                                {
                                                                    debug: 'parsePrefix>case>string',
                                                                    value: {
                                                                        value: 'hello',
                                                                    },
                                                                },
                                                                {
                                                                    debug: 'parsePrefix>case>string',
                                                                    value: {
                                                                        value: 'world',
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                    {
                                                        key: {
                                                            debug: 'parsePrefix>case>ident',
                                                            value: 'g',
                                                        },
                                                        value: {
                                                            debug: 'parsePrefix>case>true',
                                                            value: {
                                                                value: true,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
            {
                debug: 'parseLetStatement>return',
                ident: {
                    debug: 'parseLetStatement>ident',
                    value: 'x',
                },
                value: {
                    debug: 'parsePrefix>case>Lbracket',
                    elements: [
                        {
                            debug: 'parsePrefix>case>number',
                            value: {
                                value: 1,
                            },
                        },
                        {
                            debug: 'parsePrefix>case>number',
                            value: {
                                value: 2,
                            },
                        },
                        {
                            debug: 'parsePrefix>case>number',
                            value: {
                                value: 3,
                            },
                        },
                    ],
                },
            },
            {
                debug: 'parseExpressionStatement>return',
                expression: {
                    debug: 'parsePrefix>case>if',
                    condition: {
                        debug: 'parseInfixExpression>case>default',
                        left: {
                            debug: 'parsePrefix>case>ident',
                            value: 'x',
                        },
                        operator: '<',
                        right: {
                            debug: 'parsePrefix>case>number',
                            value: {
                                value: 10,
                            },
                        },
                    },
                    consequence: {
                        debug: 'parseBlockStatement>return',
                        statements: [
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parsePrefix>case>string',
                                    value: {
                                        value: 'hello',
                                    },
                                },
                            },
                        ],
                    },
                    alternative: {
                        debug: 'parseBlockStatement>return',
                        statements: [
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parsePrefix>case>ident',
                                    value: 'x',
                                },
                            },
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parsePrefix>case>false',
                                    value: {
                                        value: false,
                                    },
                                },
                            },
                            {
                                debug: 'parseExpressionStatement>return',
                                expression: {
                                    debug: 'parseInfixExpression>case>Lparen',
                                    function: {
                                        debug: 'parsePrefix>case>ident',
                                        value: 'aaa',
                                    },
                                    arguments: [
                                        {
                                            debug: 'parsePrefix>case>ident',
                                            value: 'a',
                                        },
                                        {
                                            debug: 'parsePrefix>case>number',
                                            value: {
                                                value: 10,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
        ],
    };

    eq(
        parse(`
let xxxx = fn (x, y) {
    return {
        a: 1,
        b: false,
        "c": "hello",
        "d": [1, 2, 3],
        10: "ten",
        "e": {
            f: ["hello", "world"],
            g: true
        }
    };
};

let x = [1, 2, 3];

if (x < 10) {
    x = "hello";
} else {
    x = false;
    aaa(a, 10);
}
      `),
        expected
    );
});

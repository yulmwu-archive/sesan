import test, { eq } from '.';
import { evaluator, NULL } from '../evaluator';
import { Enviroment } from '../object';
import parseOptions from '../options';
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';

test('Tokenizer token test', () => {
    const lexer = new Lexer(`
import("@std/io");

let f = func (x, y) { 
    let res = x + 2 * y; 
    res; 
};

if (f(2, 3) > 3) {
    let x = {
        "message": "hello",
        "name": "world",
        true: 18,
        "array": [1, 2, 3, false, true, "hello", "world"],
    };
    println(x)
    println(x["name"])
} else { println("X"); }

let arr = [1, 2, 3, -4, -5];
println(arr[3] + arr[4]);

if (arr[3] + arr[4] == -9) { println("Y"); }

let test = func (x) {
    println(x);
    if (x == 1) {
        1;
    } else {
        2; 
    };
};

println(test(3));
`);

    const parser = new Parser(lexer);
    const env = new Enviroment();

    eq(evaluator(parser.parseProgram(), env, parseOptions()), NULL);
    // console.log(JSON.stringify(parser.parseProgram(), null, 2));
});

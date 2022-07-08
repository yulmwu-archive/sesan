import { existsSync, readFileSync } from 'fs';
import { Evaluator, printError } from '../evaluator';
import { Enviroment, ObjectKind } from '../object';
import parseOptions from '../options';
import { Parser } from '../parser';
import { Lexer } from '../tokenizer';
import Repl from './repl';

const args = process.argv.slice(2);

const env = new Enviroment();

const option = existsSync('./tiny.config.json')
    ? parseOptions(readFileSync('./tiny.config.json').toString())
    : parseOptions();

if (args.length <= 0) new Repl(env, option).start();
else {
    try {
        const file = readFileSync(args[0], 'utf8');

        const parser = new Parser(new Lexer(file));

        const result = new Evaluator(parser.parseProgram(), env, option).eval();

        if (parser.errors.length > 0)
            parser.errors.forEach((error) => printError(error));

        if (result?.kind === ObjectKind.ERROR) printError(result.message);
    } catch (e) {
        console.error('Cannot open file: ' + args[0]);
    }
}

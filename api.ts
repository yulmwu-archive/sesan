import { readdirSync } from 'fs';
import { NULL } from './tiny/evaluator';
import Tiny, { ObjectKind } from './index';
import express from 'express';
import { stds } from './@std/index';

const app = express();

console.log(stds);

app.listen(5050, () => console.log('http://localhost:5050'));

app.get('/eval', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
        result: '',
    });
});

app.get('/eval/:code', (req, res) => {
    const result: Array<string> = [];

    new Tiny(req.params.code, {
        useStdLibAutomatically: true,
        root: './',
    })
        .setBuiltin('test', () => {
            return {
                kind: ObjectKind.STRING,
                value: readdirSync('./').join('\n'),
            };
        })
        .applyBuiltins()
        .setStdout((x) => result.push(x))
        .setStdin(() => NULL)
        .eval();

    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
        result,
    });
});

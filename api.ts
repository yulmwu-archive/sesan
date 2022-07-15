import express from 'express';
import Tiny, { ObjectKind } from './index';
import { NULL } from './tiny/evaluator';

const app = express();

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
            value: __dirname,
        }
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

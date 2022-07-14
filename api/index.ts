import Tiny, { NULL } from '../index';
import express from 'express';

const app = express();

app.listen(5050, () => console.log('http://localhost:5050'));

app.get('/eval/:code', (req, res) => {
    const result: Array<string> = [];

    new Tiny(req.params.code, {
        useStdLibAutomatically: true,
        root: '../',
    })
        .applyBuiltins()
        .setStdout((x) => result.push(x))
        .setStdin(() => NULL)
        .eval();

    res.json({
        result,
    });
});

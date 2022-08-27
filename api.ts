import { NULL } from './core/evaluator'
import Sesan from './index'
import express from 'express'

const app = express()

app.listen(5050, () => console.log('http://localhost:5050'))

app.get('/eval', (req, res) => {
    res.header('Content-Type', 'application/json')
    res.header('Access-Control-Allow-Origin', '*')

    res.json({
        result: [],
        errors: [],
    })
})

app.get('/eval/:code', (req, res) => {
    const result: Array<string> = []
    const errors: Array<string> = []

    const sesan = new Sesan(req.params.code, {
        useStdLibAutomatically: true,
        allowEval: true,
        stderrPrefix: false,
        stderrColor: false,
    })
        .setStdout((x) => result.push(x))
        .setStderr((x) => errors.push(x))
        .setStdin(() => NULL)

    const parsed = sesan.parseProgram()

    sesan.evalProgram(parsed)

    res.header('Content-Type', 'application/json')
    res.header('Access-Control-Allow-Origin', '*')

    res.json({
        result,
        errors,
        ast: parsed,
    })
})

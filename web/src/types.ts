interface IResults {
    result: Array<string>
    errors: Array<string>
    ast: string
}

interface IExamplesGroup {
    name: string
    examples: Array<IExamples>
}

interface IExamples {
    name: string
    source: string
}

export type { IResults, IExamplesGroup, IExamples }

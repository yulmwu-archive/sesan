interface IResults {
    result: Array<string>;
    errors: Array<string>;
}

interface IExamplesGroup {
    name: string;
    examples: Array<IExamples>;
}

interface IExamples {
    name: string;
    source: string;
}

export type { IResults, IExamplesGroup, IExamples };

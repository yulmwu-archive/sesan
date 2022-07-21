interface IResults {
    result: Array<string>;
    errors: Array<string>;
}

interface IExamples {
    name: string;
    source: string;
    disabled?: boolean;
}

export type { IResults, IExamples };

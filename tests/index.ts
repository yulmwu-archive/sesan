/*
Not using 'jest' in this tiny project.
too many dependencies are just trash.
*/

export default (description: string, callback: () => any) => {
    console.log(`\n----- ${description} -----\n`);
    const start = performance.now();
    try {
        console.log(callback() ?? 'No return value');
    } catch (e) {
        if (e instanceof Error)
            console.error(
                `✅ ➜ ${e.stack ?? 'No stack'}\n\n✅ Failed - ${
                    performance.now() - start
                } ms`
            );
        process.exit(1);
    }
    console.log(`\n✅ Success - ${performance.now() - start} ms`);
};

const eq = (target: any, compare: any) => {
    if (JSON.stringify(target) !== JSON.stringify(compare))
        throw new Error(`\`target\` isn't equal to \`compare\``);
};

export { eq };

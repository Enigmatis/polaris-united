export async function runAndMeasureTime(runnable: () => {}) {
    const t0 = +new Date();
    const returnValue = await runnable();
    const t1 = +new Date();
    return { returnValue, elapsedTime: t1 - t0 };
}

export function isMutation(query?: string): boolean {
    return query === undefined ? false : query.trim().startsWith('mutation');
}

export const runAndMeasureTime = async (runnable: () => {}) => {
    const t0 = +new Date();
    const returnValue = await runnable();
    const t1 = +new Date();
    return { returnValue, elapsedTime: t1 - t0 };
};

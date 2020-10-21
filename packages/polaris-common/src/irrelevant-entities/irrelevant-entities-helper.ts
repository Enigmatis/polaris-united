import { IrrelevantEntitiesResponse } from './irrelevant-entities-response';

export function mergeIrrelevantEntities(
    irrelevantEntitiesOfPaging: IrrelevantEntitiesResponse[],
): IrrelevantEntitiesResponse | undefined {
    if (!irrelevantEntitiesOfPaging || irrelevantEntitiesOfPaging.length === 0) {
        return;
    }
    const mergedIrrelevantEntities = irrelevantEntitiesOfPaging.shift();
    const queryKey = Object.keys(mergedIrrelevantEntities as any)[0];
    irrelevantEntitiesOfPaging.map(intersectIrrelevantEntities);
    return mergedIrrelevantEntities;

    function intersectIrrelevantEntities(currentIrrelevant: IrrelevantEntitiesResponse) {
        const irrelevantIds = currentIrrelevant[queryKey];
        if (!irrelevantIds) {
            return;
        }
        if (mergedIrrelevantEntities) {
            mergedIrrelevantEntities[queryKey] = mergedIrrelevantEntities[
                queryKey
            ].filter((id: string) => irrelevantIds.includes(id));
        }
    }
}

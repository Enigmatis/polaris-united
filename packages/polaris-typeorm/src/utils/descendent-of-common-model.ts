import { CommonModel, EntityMetadata } from '..';

export const isDescendentOfCommonModel = (metadata: EntityMetadata): boolean => {
    return (
        metadata.inheritanceTree.find((ancestor) => ancestor.name === CommonModel.name) !==
        undefined
    );
};

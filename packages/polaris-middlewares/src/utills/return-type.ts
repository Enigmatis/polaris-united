export const getTypeName = (info: any): string => {
    let type = info.returnType;
    while (!type.name) {
        type = type.ofType;
    }
    return type.name;
};

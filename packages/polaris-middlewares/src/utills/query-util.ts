export function isMutation(query?: string): boolean {
    return query === undefined ? false : query.trim().startsWith('mutation');
}
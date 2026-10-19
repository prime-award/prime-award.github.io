/** Номинант, за которого проголосовал пользователь, — первым; остальные в прежнем порядке. */
export function votedFirst<T extends { id: number }>(nominees: readonly T[], votedId: number | null | undefined): T[] {
    if (votedId == null) return [...nominees]
    const chosen = nominees.find((n) => n.id === votedId)
    return chosen ? [chosen, ...nominees.filter((n) => n !== chosen)] : [...nominees]
}

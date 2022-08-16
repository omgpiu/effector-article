export const enum Color {
    DEFAULT = 'default',
    AWFUL = 'awful',
    BAD = 'bad',
    POOR = 'poor',
    GOOD = 'good',
    MARVELOUS = 'marvelous'
}

export interface Badge {
    title: string,
    color: Color
}
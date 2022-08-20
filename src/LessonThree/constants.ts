import { RatingValue } from '../types'
import { Badge, Color } from './types'

export const SEND_ERROR_DATA: Badge = {
  title: 'Rate this movie, please',
  color: Color.AWFUL,
}

export const BADGE_INFO: Record<RatingValue, Badge> = {
  0: {
    title: 'Rate and leave feedback',
    color: Color.DEFAULT,
  },
  1: {
    title: 'That was horrible',
    color: Color.AWFUL,
  },
  2: {
    title: 'So bad',
    color: Color.BAD,
  },
  3: {
    title: 'Oh, so-so',
    color: Color.POOR,
  },
  4: {
    title: 'Not bad',
    color: Color.GOOD,
  },
  5: {
    title: 'Awesome',
    color: Color.MARVELOUS,
  },
}

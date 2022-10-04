import dayjs from 'dayjs'

import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default (context, inject) => {
  context.$dayjs = dayjs
  inject('dayjs', dayjs)
}

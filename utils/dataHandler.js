const dayjs = require('dayjs')

// Check and update status to 2
const checkAndUpdateEventStatus = async (events) => {
  const currentDate = new Date()

  for (const event of events) {
    if (event.status !== 1) {
      const eventDate = dayjs(event.date).add(event.durationDate, 'days').toDate()

      if (currentDate > eventDate) {
        event.status = 2
        await event.save()
      } else if (currentDate <= eventDate) {
        event.status = 0
        await event.save()
      }
    }
  }
}

module.exports = {
  checkAndUpdateEventStatus
}

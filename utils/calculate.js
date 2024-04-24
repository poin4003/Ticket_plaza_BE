const calculateTotalAmountForEvent = async (eventId) => {
  let totalAmount = 0
  const tickets = await Ticket.find({ eventId })
  
  for (const ticket of tickets) {
    const bill = await Bill.findOne({ 'tickets.ticketId': ticket._id })
    if (bill) {
      const ticketInBill = bill.tickets.find(item => item.ticketId.equals(ticket._id))
      if (ticketInBill) {
        totalAmount += ticketInBill.amount
      }
    }
  }

  return totalAmount
}

const calculateTotalMoney = (tickets) => {
  let totalPrice = 0
  for (const ticket of tickets) {
    totalPrice += ticket.price
  }
  return totalPrice
}

const calculateMoneyToPaid = (totalPrice, discount) => {
  const discountAmount = (totalPrice * discount) / 100
  const moneyToPaid = totalPrice - discountAmount
  return moneyToPaid
}

module.exports = {
  calculateTotalAmountForEvent,
  calculateTotalMoney,
  calculateMoneyToPaid
}
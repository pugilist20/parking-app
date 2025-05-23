class BookingController {
    constructor(bookingService) {
        this.bookingService = bookingService;
        this.createBooking  = this.createBooking.bind(this);
        this.getMyBookings  = this.getMyBookings.bind(this);
        this.getPending     = this.getPending.bind(this);
        this.approveBooking = this.approveBooking.bind(this);
        this.rejectBooking  = this.rejectBooking.bind(this);
        this.cancelBooking  = this.cancelBooking.bind(this);
        this.getAll         = this.getAll.bind(this);
    }
    async createBooking(req, res, next) {
        try {
            const userId = req.user.id;
            const {parking_slot_id, start_time, end_time} = req.body;
            const booking = await this.bookingService.createBooking({userId, parking_slot_id, start_time, end_time});
            return res.status(201).json(booking);
        } catch (err) {
            const status = err.status || 500;
            return res.status(status).json({message: err.message});
        }
    }
    async getMyBookings(req, res, next) {
        try {
            const bookings = await this.bookingService.getByUser(req.user.id);
            return res.json(bookings);
        } catch (err) {
            next(err);
        }
    }
    async getPending(req, res, next) {
        try {
            const bookings = await this.bookingService.getPending();
            return res.json(bookings);
        } catch (err) {
            next(err);
        }
    }
    async approveBooking(req, res, next) {
        try {
            const updated = await this.bookingService.approveBooking(
                req.params.id,
                req.user.id
            );
            return res.json(updated);
        } catch (err) {
            next(err);
        }
    }
    async rejectBooking(req, res, next) {
        try {
            const updated = await this.bookingService.rejectBooking(
                req.params.id,
                req.user.id
            );
            return res.json(updated);
        } catch (err) {
            next(err);
        }
    }
    async cancelBooking(req, res, next) {
        try {
            const updated = await this.bookingService.cancelBooking(
                req.params.id,
                req.user.id
            );
            return res.json(updated);
        } catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const { id } = req.query;
            const list = await this.bookingService.getAll({ id });
            res.json(list);
        } catch (err) {
            next(err);
        }
    }
}
module.exports = BookingController;

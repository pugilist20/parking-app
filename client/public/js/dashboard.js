// client/public/js/dashboard.js
$(function() {
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const data = {
            parking_slot_id: $('input[name=zone]').val(),
            start_time: $('input[name=start]').val(),
            end_time: $('input[name=end]').val()
        };
        api('POST', '/api/bookings', data)
            .done(res => alert('Бронь отправлена, статус: ' + res.status))
            .fail(err => alert(err.responseJSON?.message || 'Ошибка'));
    });
});

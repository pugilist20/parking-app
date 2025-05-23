$(function() {
    $('#searchForm').on('submit', async function(e) {
        e.preventDefault();
        $('#zoneResults').empty();
        const start = $('#start').val();
        const end   = $('#end').val();
        if (!start || !end) {
            return alert('Пожалуйста, выберите оба времени начала и конца.');
        }
        const startDate = new Date(start);
        const endDate   = new Date(end);
        if (endDate <= startDate) {
            return alert('Дата окончания должна быть позже даты начала.');
        }
        // Новая проверка: минимум 1 час
        const diffMs = endDate - startDate;
        if (diffMs < 60 * 60 * 1000) {
            return alert('Продолжительность бронирования должна быть не менее 1 часа.');
        }
        try {
            const zones = await api(
                'GET',
                `/api/slots/availability?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
            );
            if (!zones.length) {
                return $('#zoneResults').append(`
          <div class="col-12">
            <div class="alert alert-warning text-center">
              Нет зон с свободными местами в этом интервале.
            </div>
          </div>
        `);
            }
            zones.forEach(z => {
                const freeIds = z.freeSlotIds || [];
                const bookBtn = freeIds.length
                    ? `<button
               class="btn btn-primary mt-auto book-zone-btn"
               data-free-slot-ids='${JSON.stringify(freeIds)}'
               data-start="${start}"
               data-end="${end}"
             >
               Забронировать
             </button>`
                    : `<span class="mt-auto text-danger">Нет свободных мест</span>`;
                $('#zoneResults').append(`
          <div class="col-md-4">
            <div class="card h-100 shadow-sm d-flex flex-column">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">Зона ${z.name}</h5>
                <p class="card-text mb-1">
                  <strong>${z.freeCount}</strong> свободно из
                  <strong>${z.totalCount}</strong>
                </p>
                <p class="card-text mb-3">
                  Цена: <strong>${z.pricePerHour} ₽/ч</strong>
                </p>
                ${bookBtn}
              </div>
            </div>
          </div>
        `);
            });
        } catch (err) {
            console.error('Ошибка поиска зон:', err);
            alert('Не удалось выполнить поиск зон.');
        }
    });
    $('#zoneResults').on('click', '.book-zone-btn', async function() {
        const freeIds = JSON.parse($(this).attr('data-free-slot-ids'));
        const slotId  = freeIds[0];
        const start   = $(this).data('start');
        const end     = $(this).data('end');
        if (!slotId) {
            return alert('Ошибка: не найден свободный слот.');
        }
        try {
            await api('POST', '/api/bookings', {
                parking_slot_id: slotId,
                start_time:      start,
                end_time:        end
            });
            window.location.href = '/bookings';
        } catch (err) {
            console.error('Ошибка создания брони:', err);
            const msg = err.responseJSON?.message || 'Не удалось забронировать слот.';
            alert(msg);
        }
    });
});

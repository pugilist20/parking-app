// client/public/js/dashboard.js

$(function() {
    // 1) Обработка формы поиска свободных зон
    $('#searchForm').on('submit', async function(e) {
        e.preventDefault();
        $('#zoneResults').empty();

        const start = $('#start').val();
        const end   = $('#end').val();

        // Валидация: обе даты должны быть заполнены и end > start
        if (!start || !end) {
            return alert('Пожалуйста, выберите оба времени начала и конца.');
        }
        if (new Date(end) <= new Date(start)) {
            return alert('Дата окончания должна быть позже даты начала.');
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
                // список свободных слотов в зоне
                const freeIds = z.freeSlotIds || [];
                // кнопка или сообщение об отсутствии
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

    // 2) Обработчик клика по кнопке «Забронировать»
    $('#zoneResults').on('click', '.book-zone-btn', async function() {
        const freeIds = JSON.parse($(this).attr('data-free-slot-ids'));
        const slotId  = freeIds[0];             // первый свободный слот
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
            // После успешного создания перенаправляем на список броней
            window.location.href = '/bookings';
        } catch (err) {
            console.error('Ошибка создания брони:', err);
            const msg = err.responseJSON?.message || 'Не удалось забронировать слот.';
            alert(msg);
        }
    });
});

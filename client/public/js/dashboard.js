// client/public/js/dashboard.js
$(function(){
    $('#searchForm').on('submit', async function(e){
        e.preventDefault();
        $('#zoneResults').empty();

        const start = $('#start').val();
        const end   = $('#end').val();
        // ...валидация таймингов...

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
                // строим кнопку «Забронировать» только если есть свободные
                const bookBtn = z.freeCount > 0
                    ? `<button
               class="btn btn-primary mt-auto book-zone-btn"
               data-zone-id="${z.id}"
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
            alert('Не удалось выполнить поиск');
        }
    });

    // Обработчик клика по кнопке «Забронировать» остаётся прежним
    $('#zoneResults').on('click', '.book-zone-btn', function() {
        const zoneId = $(this).data('zone-id');
        const start  = $(this).data('start');
        const end    = $(this).data('end');
        window.location.href =
            `/bookings?zone=${zoneId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    });
});

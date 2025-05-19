$(function() {
    const $tbody   = $('#bookingsTableBody');
    const $modal   = $('#bookingModal');
    const $form    = $('#bookingForm');
    const $slotSel = $('#parking_slot_id');
    const $addBtn  = $('#addBookingBtn');

    // Утилита для декодирования Base64URL JWT
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const json      = window.atob(base64);
        return JSON.parse(json);
    }

    // Декодируем роль из токена и логируем
    let role = null;
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = parseJwt(token);
            role = payload.role;
        } catch (e) {
            console.error('JWT parse error:', e);
        }
    }

    // --- Функции загрузки данных ---
    async function loadFreeSlots() {
        try {
            const slots = await api('GET', '/api/slots/free');
            $slotSel.empty().append('<option value="" disabled selected>Выберите слот</option>');
            slots.forEach(s => {
                $slotSel.append(`<option value="${s.id}">${s.slot_number} (Зона ${s.zone_id})</option>`);
            });
        } catch (e) {
            console.error('Ошибка loadFreeSlots:', e);
            alert('Не удалось загрузить свободные слоты');
        }
    }

    function renderBookings(bookings) {
        $tbody.empty();
        bookings.forEach(b => {
            let btns = '';
            if (role === 'user') {
                if (['pending','approved'].includes(b.status)) {
                    btns = `<button class="btn btn-sm btn-danger cancel-booking">Отменить</button>`;
                }
            } else if (role === 'employee' || role === 'admin') {
                if (b.status === 'pending') {
                    btns =
                        `<button class="btn btn-sm btn-success approve-booking">✔</button>` +
                        `<button class="btn btn-sm btn-warning reject-booking ms-1">✖</button>`;
                }
            }
            $tbody.append(`
        <tr data-id="${b.id}">
          <td>${b.id}</td>
          <td>${b.parking_slot_id}</td>
          <td>${new Date(b.start_time).toLocaleString()}</td>
          <td>${new Date(b.end_time).toLocaleString()}</td>
          <td>${b.status}</td>
          <td>${btns}</td>
        </tr>
      `);
        });
    }

    async function loadMy() {
        const arr = await api('GET', '/api/bookings/my');
        renderBookings(arr);
    }

    async function loadSorted() {
        const arr = await api('GET', '/api/bookings');
        const pending = arr.filter(b => b.status === 'pending');
        const others  = arr.filter(b => b.status !== 'pending');
        renderBookings([...pending, ...others]);
    }

    // --- Инициализация страницы ---
    (async function init() {
        if (role === 'user') {
            $addBtn.hide();
            await loadMy();
        } else {
            $addBtn.show();
            if (role === 'employee' || role==="admin") {
                await loadSorted();
            } else {
                console.warn('Неизвестная роль, ничего не загружаем');
            }
        }
    })();

    // --- События ---

    // Открыть модалку создания брони (user only)
    $addBtn.on('click', async () => {
        $form[0].reset();
        await loadFreeSlots();
    });

    // Создание брони
    $form.on('submit', async function(e) {
        e.preventDefault();
        const payload = {
            parking_slot_id: parseInt($slotSel.val(), 10),
            start_time:      $('#start_time').val(),
            end_time:        $('#end_time').val()
        };
        try {
            await api('POST', '/api/bookings', payload);
            $modal.modal('hide');
            await loadMy();
        } catch (err) {
            console.error('Ошибка создания брони:', err);
            alert(err.responseJSON?.message || 'Ошибка создания брони');
        }
    });

    // Обработчики кнопок в таблице
    $tbody
        .on('click', '.cancel-booking', async function() {
            const id = $(this).closest('tr').data('id');
            if (!confirm('Отменить бронирование?')) return;
            try {
                await api('POST', `/api/bookings/cancel/${id}`);
                await loadMy();
            } catch (err) {
                console.error('Ошибка отмены:', err);
                alert('Ошибка отмены');
            }
        })
        .on('click', '.approve-booking', async function() {
            const id = $(this).closest('tr').data('id');
            try {
                await api('POST', `/api/bookings/approve/${id}`);
                await loadPending();
            } catch (err) {
                console.error('Ошибка одобрения:', err);
                alert('Ошибка одобрения');
            }
        })
        .on('click', '.reject-booking', async function() {
            const id = $(this).closest('tr').data('id');
            try {
                await api('POST', `/api/bookings/reject/${id}`);
                await loadPending();
            } catch (err) {
                console.error('Ошибка отклонения:', err);
                alert('Ошибка отклонения');
            }
        });
});

$(function() {
    const $tbody   = $('#bookingsTableBody');
    const $modal   = $('#bookingModal');
    const $form    = $('#bookingForm');
    const $slotSel = $('#parking_slot_id');
    const $addBtn  = $('#addBookingBtn');
    const $search  = $('#bookingSearch');
    let allBookings = [];
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    }
    let role = null;
    const token = localStorage.getItem('token');
    if (token) {
        try {
            role = parseJwt(token).role;
        } catch (e) {
            console.error('JWT parse error:', e);
        }
    }
    (async function autoBook() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('zone') && params.has('start') && params.has('end')) {
            const zoneId = parseInt(params.get('zone'), 10);
            const start  = params.get('start');
            const end    = params.get('end');
            try {
                const slots = await api('GET', `/api/slots/zone/${zoneId}`);
                const free = slots.filter(s => s.status === 'free');
                if (!free.length) {
                    alert('Нет свободных слотов в выбранной зоне');
                } else {
                    await api('POST', '/api/bookings', {
                        parking_slot_id: free[0].id,
                        start_time:      start,
                        end_time:        end
                    });
                }
            } catch (err) {
                console.error('Ошибка авто-бронирования:', err);
                alert(err.responseJSON?.message || 'Ошибка создания брони');
            }
            window.history.replaceState({}, '', '/bookings');
        }
    })();
    async function loadFreeSlots() {
        const slots = await api('GET', '/api/slots/free');
        $slotSel.empty().append('<option value="" disabled selected>Выберите слот</option>');
        slots.forEach(s => {
            $slotSel.append(`<option value="${s.id}">${s.slot_number} (Зона ${s.zone_id})</option>`);
        });
    }
    function renderBookings(bookings) {
        $tbody.empty();
        bookings.forEach(b => {
            let btns = '';
            if (role === 'user' && ['pending','approved'].includes(b.status)) {
                btns = `<button class="btn btn-sm btn-danger cancel-booking">Отменить</button>`;
            }
            if ((role === 'employee' || role === 'admin') && (b.status === 'pending'||b.status === 'approved'||b.status === 'rejected')) {
                btns = `<button class="btn btn-sm btn-success approve-booking">✔</button>` +
                    `<button class="btn btn-sm btn-warning reject-booking ms-1">✖</button>`;
            }
            $tbody.append(`
                <tr data-id="${b.id}">
                  <td>${b.id}</td>
                  <td>${b.parking_slot_id}</td>
                  <td>${b.start_time}</td>
                  <td>${b.end_time}</td>
                  <td>${b.status}</td>
                  <td>${btns}</td>
                </tr>
            `);
        });
    }
    async function loadMy() {
        const arr = await api('GET', '/api/bookings/my');
        allBookings = arr;
        renderBookings(allBookings);
    }
    async function loadSorted() {
        const arr = await api('GET', '/api/bookings');
        allBookings = [...arr.filter(b => b.status === 'pending'), ...arr.filter(b => b.status !== 'pending')];
        renderBookings(allBookings);
    }
    (async function init() {
        if (role === 'user') {
            $addBtn.hide();
            await loadMy();
        } else {
            $addBtn.show();
            await loadSorted();
        }
    })();
    $search.on('input', function() {
        const q = $(this).val().trim();
        if (!q) {
            renderBookings(allBookings);
            return;
        }
        const id = parseInt(q, 10);
        if (isNaN(id)) {
            $tbody.empty();
            return;
        }
        const filtered = allBookings.filter(b => b.id === id);
        renderBookings(filtered);
    });
    $addBtn.on('click', async () => {
        $form[0].reset();
        await loadFreeSlots();
    });
    $form.on('submit', async e => {
        e.preventDefault();
        const payload = {
            parking_slot_id: parseInt($slotSel.val(), 10),
            start_time:      $('#start_time').val(),
            end_time:        $('#end_time').val()
        };
        try {
            await api('POST', '/api/bookings', payload);
            $('#bookingModal').modal('hide');
            await loadMy();
        } catch (err) {
            alert(err.responseJSON?.message || 'Ошибка создания брони');
        }
    });
    $tbody
        .on('click', '.cancel-booking', async function() {
            const id = $(this).closest('tr').data('id');
            if (!confirm('Отменить бронирование?')) return;
            await api('POST', `/api/bookings/cancel/${id}`);
            await loadMy();
        })
        .on('click', '.approve-booking', async function() {
            const id = $(this).closest('tr').data('id');
            await api('POST', `/api/bookings/approve/${id}`);
            await loadSorted();
        })
        .on('click', '.reject-booking', async function() {
            const id = $(this).closest('tr').data('id');
            await api('POST', `/api/bookings/reject/${id}`);
            await loadSorted();
        });
});

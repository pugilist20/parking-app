$(function() {
    const $tbody  = $('#slotsTableBody');
    const $search = $('#slotSearch');
    const $modal  = $('#slotModal');
    const $form   = $('#slotForm');
    const $label  = $('#slotModalLabel');
    const $selectZone = $('#zone_id');
    let zones = [];
    async function loadZones() {
        try {
            zones = await api('GET', '/api/zones');
            $selectZone.empty().append(
                '<option value="" disabled selected>Выберите зону</option>'
            );
            zones.forEach(z => {
                $selectZone.append(
                    `<option value="${z.id}">${z.id} — ${z.name}</option>`
                );
            });
        } catch {
            alert('Не удалось загрузить зоны');
        }
    }
    async function loadSlots(filter = '') {
        try {
            const url = filter
                ? `/api/slots?slot_number=${encodeURIComponent(filter)}`
                : '/api/slots';
            const slots = await api('GET', url);
            $tbody.empty();
            slots.forEach(s => {
                $tbody.append(`
          <tr data-id="${s.id}">
            <td>${s.id}</td>
            <td>${s.slot_number}</td>
            <td>${s.zone_id}</td>
            <td>${s.status}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-slot">✎</button>
              <button class="btn btn-sm btn-danger delete-slot">🗑</button>
            </td>
          </tr>
        `);
            });
        } catch {
            alert('Ошибка загрузки слотов');
        }
    }
    loadSlots();
    let timeout;
    $search.on('input', function(){
        clearTimeout(timeout);
        const q = this.value.trim();
        timeout = setTimeout(() => loadSlots(q), 200);
    });
    (async function init() {
        await loadZones();
        await loadSlots();
    })();
    $('#addSlotBtn').on('click', () => {
        $label.text('Добавить слот');
        $form[0].reset();
        $('#slotId').val('');
    });
    $tbody.on('click', '.edit-slot', function() {
        const $tr   = $(this).closest('tr');
        const id    = $tr.data('id');
        const number = $tr.find('td').eq(1).text();
        const zone  = $tr.find('td').eq(2).text();
        const status= $tr.find('td').eq(3).text();

        $label.text(`Редактировать слот #${id}`);
        $('#slotId').val(id);
        $('#slot_number').val(number);
        $('#zone_id').val(zone);
        $('#status').val(status);
        $modal.modal('show');
    });
    $form.on('submit', async function(e) {
        e.preventDefault();
        const id = $('#slotId').val();
        const payload = {
            slot_number: parseInt($('#slot_number').val(), 10),
            zone_id:     parseInt($('#zone_id').val(), 10),
            status:      $('#status').val()
        };
        try {
            if (id) {
                await api('PUT', `/api/slots/${id}`, payload);
            } else {
                await api('POST', '/api/slots', payload);
            }
            $modal.modal('hide');
            loadSlots();
        } catch (err) {
            alert(err.responseJSON?.message || 'Ошибка сохранения слота');
        }
    });
    $tbody.on('click', '.delete-slot', async function() {
        if (!confirm('Удалить слот?')) return;
        const id = $(this).closest('tr').data('id');
        try {
            await api('DELETE', `/api/slots/${id}`);
            loadSlots();
        } catch {
            alert('Ошибка удаления слота');
        }
    });
});

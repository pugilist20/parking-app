$(function() {
    const $tbody    = $('#zonesTableBody');
    const $modal    = $('#zoneModal');
    const $form     = $('#zoneForm');
    const $label    = $('#zoneModalLabel');
    const $tariffSel= $('#tariff_id');
    const $search = $('#zoneSearch');
    let tariffs = [];
    async function loadTariffsList() {
        try {
            tariffs = await api('GET', '/api/tariffs');
            $tariffSel.empty().append(
                '<option value="" disabled selected>Выберите тариф</option>'
            );
            tariffs.forEach(t => {
                $tariffSel.append(`<option value="${t.id}">${t.name} (${t.price_per_hour})</option>`);
            });
        } catch {
            alert('Не удалось загрузить тарифы');
        }
    }
    async function loadZones(filter='') {
        try {
            const base = '/api/zones';
            const url  = filter
                ? `${base}?name=${encodeURIComponent(filter)}`
                : base;
            const list = await api('GET', url);
            $tbody.empty();
            list.forEach(z => {
                $tbody.append(`
          <tr data-id="${z.id}">
            <td>${z.id}</td>
            <td>${z.name}</td>
            <td>${z.tariff_id}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-zone">✎</button>
              <button class="btn btn-sm btn-danger delete-zone">🗑</button>
            </td>
          </tr>
        `);
            });
        } catch {
            alert('Ошибка загрузки зон');
        }
    }
    loadZones();
    let timeout;
    $search.on('input', function(){
        clearTimeout(timeout);
        const q = this.value.trim();
        timeout = setTimeout(() => loadZones(q), 200);
    });
    (async function init() {
        await loadTariffsList();
        await loadZones();
    })();
    $('#addZoneBtn').on('click', () => {
        $label.text('Добавить зону');
        $form[0].reset();
        $('#zoneId').val('');
    });
    $tbody.on('click', '.edit-zone', function() {
        const $tr = $(this).closest('tr');
        const id  = $tr.data('id');
        const cols = $tr.find('td');
        $label.text(`Редактировать зону #${id}`);
        $('#zoneId').val(id);
        $('#name').val(cols.eq(1).text());
        $('#tariff_id').val(cols.eq(2).text());
        $modal.modal('show');
    });
    $form.on('submit', async function(e) {
        e.preventDefault();
        const id = $('#zoneId').val();
        const data = {
            name: $('#name').val(),
            tariff_id: parseInt($('#tariff_id').val(), 10)
        };
        try {
            if (id) {
                await api('PUT', `/api/zones/${id}`, data);
            } else {
                await api('POST', '/api/zones', data);
            }
            $modal.modal('hide');
            await loadTariffsList();
            loadZones();
        } catch (err) {
            alert(err.responseJSON?.message || 'Ошибка сохранения зоны');
        }
    });
    $tbody.on('click', '.delete-zone', async function() {
        if (!confirm('Удалить зону?')) return;
        const id = $(this).closest('tr').data('id');
        try {
            await api('DELETE', `/api/zones/${id}`);
            loadZones();
        } catch {
            alert('Ошибка удаления зоны');
        }
    });
});
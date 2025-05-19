// client/public/js/zones.js
$(function() {
    const $tbody    = $('#zonesTableBody');
    const $modal    = $('#zoneModal');
    const $form     = $('#zoneForm');
    const $label    = $('#zoneModalLabel');
    const $tariffSel= $('#tariff_id');

    let tariffs = [];

    // Загрузка тарифов для селекта
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

    // Загрузка и рендер зон
    async function loadZones() {
        try {
            const zones = await api('GET', '/api/zones');
            $tbody.empty();
            zones.forEach(z => {
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

    // Инициализация
    (async function init() {
        await loadTariffsList();
        await loadZones();
    })();

    // Открыть модалку «Добавить»
    $('#addZoneBtn').on('click', () => {
        $label.text('Добавить зону');
        $form[0].reset();
        $('#zoneId').val('');
    });

    // Открыть модалку «Редактировать»
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

    // Сохранение (POST/PUT)
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

    // Удаление
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

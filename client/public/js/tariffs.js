// client/public/js/tariffs.js
$(function() {
    const $tbody   = $('#tariffsTableBody');
    const $modal   = $('#tariffModal');
    const $form    = $('#tariffForm');
    const $label   = $('#tariffModalLabel');

    async function loadTariffs() {
        try {
            const tariffs = await api('GET', '/api/tariffs');
            $tbody.empty();
            tariffs.forEach(t => {
                $tbody.append(`
          <tr data-id="${t.id}">
            <td>${t.id}</td>
            <td>${t.name}</td>
            <td>${t.price_per_hour}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-tariff">✎</button>
              <button class="btn btn-sm btn-danger delete-tariff">🗑</button>
            </td>
          </tr>
        `);
            });
        } catch {
            alert('Ошибка загрузки тарифов');
        }
    }

    // Инициализация
    loadTariffs();

    // Открыть модалку «Добавить»
    $('#addTariffBtn').on('click', () => {
        $label.text('Добавить тариф');
        $form[0].reset();
        $('#tariffId').val('');
    });

    // Открыть модалку «Редактировать»
    $tbody.on('click', '.edit-tariff', function() {
        const $tr = $(this).closest('tr');
        const id  = $tr.data('id');
        const cols = $tr.find('td');
        $label.text(`Редактировать тариф #${id}`);
        $('#tariffId').val(id);
        $('#name').val(cols.eq(1).text());
        $('#price_per_hour').val(cols.eq(2).text());
        $modal.modal('show');
    });

    // Сохранение (создать/обновить)
    $form.on('submit', async function(e) {
        e.preventDefault();
        const id    = $('#tariffId').val();
        const data  = {
            name: $('#name').val(),
            price_per_hour: parseFloat($('#price_per_hour').val())
        };
        try {
            if (id) {
                await api('PUT', `/api/tariffs/${id}`, data);
            } else {
                await api('POST', '/api/tariffs', data);
            }
            $modal.modal('hide');
            loadTariffs();
        } catch (err) {
            alert(err.responseJSON?.message || 'Ошибка сохранения тарифа');
        }
    });

    // Удаление
    $tbody.on('click', '.delete-tariff', async function() {
        if (!confirm('Удалить тариф?')) return;
        const id = $(this).closest('tr').data('id');
        try {
            await api('DELETE', `/api/tariffs/${id}`);
            loadTariffs();
        } catch {
            alert('Ошибка удаления тарифа');
        }
    });
});

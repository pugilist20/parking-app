$(function() {
    const $tableBody = $('#carsTableBody');
    const $modal     = $('#carModal');
    const $form      = $('#carForm');
    const $label     = $('#carModalLabel');
    const $search    = $('#carSearch');
    async function loadCars(filter = '') {
        try {
            const url = filter
                ? `/api/cars/filter?license_plate=${encodeURIComponent(filter)}`
                : '/api/cars';
            const cars = await api('GET', url);
            $tableBody.empty();
            cars.forEach(c => {
                $tableBody.append(`
          <tr data-id="${c.id}">
            <td>${c.id}</td>
            <td>${c.license_plate}</td>
            <td>${c.model}</td>
            <td>${c.entry_time||''}</td>
            <td>${c.exit_time||''}</td>
            <td>${c.parking_slot_id}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-btn">✎</button>
              <button class="btn btn-sm btn-warning release-btn">🔓</button>
              <button class="btn btn-sm btn-danger delete-btn">🗑</button>
            </td>
          </tr>
        `);
            });
        } catch {
            alert('Ошибка загрузки автомобилей');
        }
    }
    loadCars();
    let timeout;
    $search.on('input', function(){
        clearTimeout(timeout);
        const q = this.value.trim();
        timeout = setTimeout(() => loadCars(q), 300);
    });
    $('#addCarBtn').on('click', () => {
        $label.text('Добавить автомобиль');
        $form[0].reset();
        $('#carId').val('');
    });
    $tableBody.on('click', '.edit-btn', function() {
        const $tr = $(this).closest('tr');
        const id  = $tr.data('id');
        $label.text(`Редактировать #${id}`);
        $('#carId').val(id);
        $('#license_plate').val($tr.find('td').eq(1).text());
        $('#model').val($tr.find('td').eq(2).text());
        $('#parking_slot_id').val($tr.find('td').eq(5).text());
        $modal.modal('show');
    });
    $form.on('submit', async function(e) {
        e.preventDefault();
        const id = $('#carId').val();
        const data = {
            license_plate: $('#license_plate').val(),
            model:         $('#model').val(),
            parking_slot_id: parseInt($('#parking_slot_id').val(), 10)
        };
        try {
            if (id) {
                await api('PUT', `/api/cars/${id}`, data);
            } else {
                await api('POST', '/api/cars', data);
            }
            $modal.modal('hide');
            loadCars();
        } catch (err) {
            alert(err.responseJSON?.message || 'Ошибка сохранения');
        }
    });
    $tableBody.on('click', '.release-btn', async function() {
        const id = $(this).closest('tr').data('id');
        try {
            await api('POST', `/api/cars/release/${id}`);
            loadCars();
        } catch {
            alert('Ошибка освобождения слота');
        }
    });
    $tableBody.on('click', '.delete-btn', async function() {
        if (!confirm('Удалить эту машину?')) return;
        const id = $(this).closest('tr').data('id');
        try {
            await api('DELETE', `/api/cars/${id}`);
            loadCars();
        } catch {
            alert('Ошибка удаления');
        }
    });
});

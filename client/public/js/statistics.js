$(function() {
    if ($('#totalBookings').length === 0) {
        return;
    }

    function todayISO() {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // По умолчанию — последняя неделя:
    const defaultEnd = todayISO();
    const defaultStart = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    })();

    // Устанавливаем стартовые значения в date-поля:
    $('#startDate').val(defaultStart);
    $('#endDate').val(defaultEnd);

    // Формирует GET-параметры ?start=…&end=…
    function getDateQueryParams() {
        const start = $('#startDate').val();
        const end = $('#endDate').val();
        const params = new URLSearchParams();
        if (start) params.append('start', start);
        if (end)   params.append('end',   end);
        return params.toString();
    }

    // 2.2. Загрузка «Обзора» (здесь: бронирования, одобренные, автомобили, выручка, пользователи)
    async function loadOverview() {
        try {
            const qs = getDateQueryParams();
            const url = `/api/statistics/overview${qs ? '?' + qs : ''}`;
            const data = await api('GET', url);

            $('#totalBookings').text(data.totalBookings);
            $('#approvedCount').text(data.approvedCount);
            $('#totalCars').text(data.totalCars);
            $('#totalRevenue').text(`₽${data.totalRevenue.toFixed(2)}`);
            $('#totalUsers').text(data.totalUsers);
        } catch (err) {
            console.error('Ошибка loadOverview():', err);
            alert('Не удалось загрузить сводную статистику');
        }
    }

    // 2.3. Загрузка «Зон» (с учётом нового столбца — автомобили)
    async function loadZonesStats() {
        try {
            const qs = getDateQueryParams();
            const url = `/api/statistics/zones${qs ? '?' + qs : ''}`;
            const zones = await api('GET', url);

            const $tbody = $('#zonesStatsBody');
            $tbody.empty();

            zones.forEach(z => {
                $tbody.append(`
                    <tr>
                      <td>${z.zoneId}</td>
                      <td>${z.zoneName}</td>
                      <td>${z.totalSlots}</td>
                      <td>${z.freeSlots}</td>
                      <td>${z.approvedBookings}</td>
                      <td>${z.carsCount}</td>
                      <td>₽${z.revenue.toFixed(2)}</td>
                    </tr>
                `);
            });
        } catch (err) {
            console.error('Ошибка loadZonesStats():', err);
            alert('Не удалось загрузить статистику по зонам');
        }
    }

    // 2.4. Обработчик формы фильтрации по датам
    $('#dateFilterForm').on('submit', function(e) {
        e.preventDefault();
        const start = $('#startDate').val();
        const end   = $('#endDate').val();
        if (start && end && start > end) {
            alert('Дата «с» не может быть больше даты «по»');
            return;
        }
        reloadAll();
    });

    async function reloadAll() {
        await loadOverview();
        await loadZonesStats();
    }

    reloadAll();
});

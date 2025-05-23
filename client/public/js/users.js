$(function () {
    const $tbody = $('#usersTableBody');
    const $modal = $('#userModal');
    const $form = $('#userForm');
    const $label = $('#userModalLabel');
    const $search = $('#searchUserInput');
    let allUsers = [];
    function formatDateTime(input) {
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input)) {
            return input;
        }
        const d = new Date(input);
        if (isNaN(d)) return input;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ` +
            `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    async function loadUsers() {
        try {
            const users = await api('GET', '/api/users');
            allUsers = users;
            $tbody.empty();
            users.forEach(u => {
                $tbody.append(`
          <tr data-id="${u.id}">
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.fullname || ''}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${formatDateTime(u.createdAt)}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-user">✎</button>
              <button class="btn btn-sm btn-danger delete-user">🗑</button>
            </td>
          </tr>
        `);
            });
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
            alert('Ошибка загрузки пользователей');
        }
    }
    loadUsers();
    $search.on('input', function() {
        const q = $(this).val().trim();
        if (!q) {
            loadUsers();
            return;
        }
        const id = parseInt(q, 10);
        if (isNaN(id)) {
            $tbody.empty();
            return;
        }
        const filtered = allUsers.filter(u => u.id === id);
        $tbody.empty();
        filtered.forEach(u => {
            $tbody.append(`
          <tr data-id="${u.id}">
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.fullname || ''}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${formatDateTime(u.createdAt)}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-user">✎</button>
              <button class="btn btn-sm btn-danger delete-user">🗑</button>
            </td>
          </tr>
        `);
        });
    });
    $('#addUserBtn').on('click', () => {
        $label.text('Добавить пользователя');
        $form[0].reset();
        $('#userId').val('');
    });
    $tbody.on('click', '.edit-user', function () {
        const $tr = $(this).closest('tr');
        const id = $tr.data('id');
        const cols = $tr.find('td');
        $label.text(`Редактировать #${id}`);
        $('#userId').val(id);
        $('#username').val(cols.eq(1).text());
        $('#password').val('');
        $('#fullname').val(cols.eq(2).text());
        $('#email').val(cols.eq(3).text());
        $('#role').val(cols.eq(4).text());
        $modal.modal('show');
    });
    $form.on('submit', async function (e) {
        e.preventDefault();
        const id = $('#userId').val();
        const payload = {
            username: $('#username').val(),
            fullname: $('#fullname').val(),
            email: $('#email').val(),
            role: $('#role').val()
        };
        if ($('#password').val()) {
            payload.password = $('#password').val();
        }
        try {
            if (id) {
                await api('PUT', `/api/users/${id}`, payload);
            } else {
                await api('POST', '/api/users', payload);
            }
            $modal.modal('hide');
            loadUsers();
        } catch (err) {
            console.error('Ошибка сохранения пользователя:', err);
            alert(err.responseJSON?.message || 'Ошибка сохранения пользователя');
        }
    });
    $tbody.on('click', '.delete-user', async function () {
        if (!confirm('Удалить пользователя?')) return;
        const id = $(this).closest('tr').data('id');

        try {
            await api('DELETE', `/api/users/${id}`);
            loadUsers();
        } catch (err) {
            console.error('Ошибка удаления пользователя:', err);
            alert(err.responseJSON?.message || 'Ошибка удаления пользователя');
        }
    });
});

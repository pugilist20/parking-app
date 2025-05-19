// client/public/js/users.js
$(function() {
    const $tbody    = $('#usersTableBody');
    const $modal    = $('#userModal');
    const $form     = $('#userForm');
    const $label    = $('#userModalLabel');

    // 1) Загрузка пользователей
    async function loadUsers() {
        try {
            const users = await api('GET', '/api/users');
            $tbody.empty();
            users.forEach(u => {
                $tbody.append(`
          <tr data-id="${u.id}">
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.fullname}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${new Date(u.createdAt).toLocaleString()}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-user">✎</button>
              <button class="btn btn-sm btn-danger delete-user">🗑</button>
            </td>
          </tr>
        `);
            });
        } catch {
            alert('Ошибка загрузки пользователей');
        }
    }

    loadUsers();

    // 2) Открыть модалку «Добавить»
    $('#addUserBtn').on('click', () => {
        $label.text('Добавить пользователя');
        $form[0].reset();
        $('#userId').val('');
    });

    // 3) Открыть модалку «Редактировать»
    $tbody.on('click', '.edit-user', function() {
        const $tr   = $(this).closest('tr');
        const id    = $tr.data('id');
        const cols  = $tr.find('td');
        $label.text(`Редактировать #${id}`);
        $('#userId').val(id);
        $('#username').val(cols.eq(1).text());
        $('#password').val('');
        $('#fullname').val(cols.eq(2).text());
        $('#email').val(cols.eq(3).text());
        $('#role').val(cols.eq(4).text());
        $modal.modal('show');
    });

    // 4) Сохранение (создание/обновление)
    $form.on('submit', async function(e) {
        e.preventDefault();
        const id = $('#userId').val();
        const payload = {
            username: $('#username').val(),
            fullname: $('#fullname').val(),
            email:    $('#email').val(),
            role:     $('#role').val()
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
            alert(err.responseJSON?.message || 'Ошибка сохранения пользователя');
        }
    });

    // 5) Удаление
    $tbody.on('click', '.delete-user', async function() {
        if (!confirm('Удалить пользователя?')) return;
        const id = $(this).closest('tr').data('id');
        try {
            await api('DELETE', `/api/users/${id}`);
            loadUsers();
        } catch {
            alert('Ошибка удаления пользователя');
        }
    });
});

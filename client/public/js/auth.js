// client/public/js/auth.js

$(function() {
    // Пути, доступные без токена
    const publicPaths = ['/login', '/register'];
    const path = window.location.pathname;
    const token = localStorage.getItem('token');

    // Утилита для декодирования Base64URL-JWT
    function parseJwt(t) {
        const base64Url = t.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        if (pad) base64 += '='.repeat(4 - pad);
        return JSON.parse(window.atob(base64));
    }

    // Карта разрешённых страниц для каждой роли
    const roleAllowed = {
        admin:    ['/dashboard','/cars','/slots','/tariffs','/zones','/bookings','/users'],
        employee: ['/dashboard','/cars','/slots','/bookings'],
        user:     ['/dashboard','/bookings'],
        guest:    ['/dashboard','/bookings']
    };

    // 1) Без токена — редирект на /login
    if (!publicPaths.includes(path) && !token) {
        window.location.href = '/login';
        return;
    }

    // 2) Логинимся/регистрируемся — обрабатываем формы ниже
    if (path === '/login' || path === '/register') {
        // скрываем навигацию на публичных страницах
        $('.navbar').hide();
    } else {
        // 3) С токеном на защищённых — проверяем роль и редиректим при необходимости
        let role = null;
        try {
            const payload = parseJwt(token);
            role = payload.role;
        } catch (e) {
            console.error('JWT parse error:', e);
            // если не смогли распознать токен — уйти на вход
            return window.location.href = '/login';
        }
        const allowed = roleAllowed[role] || ['/dashboard'];
        if (!allowed.includes(path)) {
            return window.location.href = '/dashboard';
        }
        // 4) Скрываем в меню ссылки, которых нет в roleAllowed[role]
        $('nav.navbar .nav-link').each(function() {
            const href = $(this).attr('href') || '';
            if (href === '#' || href === '/logout') return;
            if (!roleAllowed[role].includes(href)) {
                $(this).closest('li.nav-item').hide();
            }
        });
    }

    // 5) Общая кнопка «Выйти»
    $('#logout').on('click', e => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    // 6) Обработчик формы входа
    if (path === '/login' && $('#loginForm').length) {
        $('#loginForm').on('submit', async function(e) {
            e.preventDefault();
            $('#loginError').hide();
            try {
                const res = await api('POST', '/api/auth/login', {
                    username: $('#username').val(),
                    password: $('#password').val()
                });
                localStorage.setItem('token', res.token);
                window.location.href = '/dashboard';
            } catch {
                $('#loginError').text('Неправильный логин или пароль').show();
            }
        });
    }

    // 7) Обработчик формы регистрации
    if (path === '/register' && $('#registerForm').length) {
        $('#registerForm').on('submit', async function(e) {
            e.preventDefault();
            $('#registerError').hide();
            try {
                const res = await api('POST', '/api/auth/register', {
                    username: $('#username').val(),
                    password: $('#password').val(),
                    fullname: $('#fullname').val(),
                    email:    $('#email').val()
                });
                localStorage.setItem('token', res.token);
                window.location.href = '/dashboard';
            } catch (err) {
                const msg = err.responseJSON?.message || 'Ошибка регистрации';
                $('#registerError').text(msg).show();
            }
        });
    }
});

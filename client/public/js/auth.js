$(function() {
    const publicPaths = ['/login', '/register'];
    const path = window.location.pathname;
    const token = localStorage.getItem('token');
    function parseJwt(t) {
        const base64Url = t.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        if (pad) base64 += '='.repeat(4 - pad);
        return JSON.parse(window.atob(base64));
    }
    const roleAllowed = {
        admin:    ['/dashboard','/cars','/slots','/tariffs','/zones','/bookings','/users'],
        employee: ['/dashboard','/cars','/slots','/bookings'],
        user:     ['/dashboard','/bookings'],
        guest:    ['/dashboard','/bookings']
    };
    if (!publicPaths.includes(path) && !token) {
        window.location.href = '/login';
        return;
    }
    if (path === '/login' || path === '/register') {
        $('.navbar').hide();
    } else {
        let role = null;
        try {
            const payload = parseJwt(token);
            role = payload.role;
        } catch (e) {
            console.error('JWT parse error:', e);
            return window.location.href = '/login';
        }
        const allowed = roleAllowed[role] || ['/dashboard'];
        if (!allowed.includes(path)) {
            return window.location.href = '/dashboard';
        }
        $('nav.navbar .nav-link').each(function() {
            const href = $(this).attr('href') || '';
            if (href === '#' || href === '/logout') return;
            if (!roleAllowed[role].includes(href)) {
                $(this).closest('li.nav-item').hide();
            }
        });
    }
    $('#logout').on('click', e => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/login';
    });
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

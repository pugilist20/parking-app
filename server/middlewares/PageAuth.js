const { authMiddleware } = require('./AuthMiddleware');

function pageRoleCheck(roles) {
    return [
        authMiddleware,
        (req, res, next) => {
            const role = req.user?.role;
            if (!role || !roles.includes(role)) {
                return res.redirect('/dashboard');
            }
            next();
        }
    ];
}

module.exports = { pageRoleCheck };
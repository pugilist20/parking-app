function api(method, url, data) {
    return $.ajax({
        method, url,
        contentType: 'application/json',
        data: data?JSON.stringify(data):undefined,
        headers: { Authorization: 'Bearer '+localStorage.getItem('token') }
    });
}

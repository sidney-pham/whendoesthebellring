document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('test').innerHTML = 'Dynamic content!!!';

    document.getElementById('checkToken').addEventListener('click', function() {
        var token;

        var request = new XMLHttpRequest();
        request.open('GET', '/token');
        request.addEventListener('load', function() {
            if (request.status == 200) {
                token = JSON.parse(this.responseText);
            } else {
                token = '/token fucked up: ' + this.response || 'No error message.';
            }
            document.getElementById('token').innerHTML = JSON.stringify(token, null, 2);
        });
        request.send(null);
    });
});
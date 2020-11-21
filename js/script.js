function startStopwatch() {
    var start = new Date().getTime();

    var x = setInterval(function() {
        var elapsed =  new Date(new Date().getTime() - start);
        var hh = pad(elapsed.getUTCHours());
        var mm = pad(elapsed.getMinutes());
        var ss = pad(elapsed.getSeconds());
        var timeString = `${hh}:${mm}:${ss}`;
        document.getElementById("stopwatch").innerHTML = timeString;
    }, 1000);
}

function pad(n){return n<10 ? '0'+n : n}
// startStopwatch();
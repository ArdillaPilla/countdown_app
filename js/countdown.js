const params = new URLSearchParams(window.location.search);
const countdownId = params.get("id");

db.collection("countdowns").doc(countdownId).get().then((doc) => {
    if (!doc.exists) {
        document.getElementById("titulo").textContent = "Countdown no encontrado";
        document.getElementById("contador").textContent = "";
        return;
    }

    const data = doc.data();
    document.getElementById("titulo").textContent = data.title;
    const fechaObjetivo = data.date;

    function actualizarContador() {
        const ahora = new Date();
        const objetivo = new Date(fechaObjetivo);
        const diferencia = objetivo - ahora;

        if (diferencia <= 0) {
            document.getElementById("contador").textContent = "¡Llegó el momento!";
            return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
        const segundos = Math.floor((diferencia / 1000) % 60);

        document.getElementById("contador").textContent =
            `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }

    setInterval(actualizarContador, 1000);
    actualizarContador();
});

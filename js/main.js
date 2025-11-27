function crearCountdown() {
    const titulo = document.getElementById("titulo").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!titulo || !fecha) {
        alert("Rellena el título y la fecha.");
        return;
    }

    // Guardar en Firestore
    db.collection("countdowns").add({
        title: titulo,
        date: fecha,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Countdown guardado con ID:", docRef.id);
        const url = `countdown.html?id=${docRef.id}`;
        document.getElementById("link").innerHTML =
            `<a href="${url}" target="_blank">Abrir countdown</a>`;
    })
    .catch((error) => {
        console.error("Error guardando countdown:", error);
    });
}

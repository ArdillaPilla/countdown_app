const lista = document.getElementById("lista-countdowns");

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
        const url = `countdown.html?id=${docRef.id}`;
        document.getElementById("link").innerHTML =
            `<a href="${url}" target="_blank">Abrir countdown</a>`;
    })
    .catch((error) => {
        console.error("Error guardando countdown:", error);
    });
}

// Listar todos los countdowns
db.collection("countdowns")
  .orderBy("createdAt", "desc")
  .onSnapshot((snapshot) => {
    lista.innerHTML = "";
    snapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement("div");
        div.innerHTML = `<a href="countdown.html?id=${doc.id}">${data.title} - ${data.date}</a>`;
        lista.appendChild(div);
    });
});

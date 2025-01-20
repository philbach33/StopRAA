// Initialiser IndexedDB
let db;
const dbRequest = indexedDB.open("UserDataDB", 2);

dbRequest.onupgradeneeded = function (event) {
    db = event.target.result;
    console.log("onupgradeneeded");

    if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
    }

    if (!db.objectStoreNames.contains("login")) {
        db.createObjectStore("login", { keyPath: "id", autoIncrement: true });
    }
};

dbRequest.onsuccess = function (event) {
    db = event.target.result;
    console.log("onsuccess");

    // Vérifier les données locales et les synchroniser dès que l'application s'ouvre
    if (navigator.onLine) {
        syncLocalData();
    }
};

dbRequest.onerror = function (event) {
	writeToDebug ('Erreur initialisation IndexedDB');
    console.error("Erreur lors de l'initialisation d'IndexedDB:", event.target.error);
};

function writeToDebug (str)
{
	console.log (str);
	/*
	var text = document.getElementById("debug").innerHTML;

	str = text + '<br>' + str;
	document.getElementById("debug").innerHTML = str;*/
}


// Fonction pour enregistrer les données localement
function saveToIndexedDB(data) {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    store.add(data);
  	
  	writeToDebug ('Données enregistrées localement : [' + data['id'] + ']= ' + data['nom'] + ' ' + data['prenom']);
    console.log("Données enregistrées localement :", data);
}

// Fonction pour enregistrer les données localement
function saveLoginToIndexedDB(data) {
    const transaction = db.transaction("login", "readwrite");
    const store = transaction.objectStore("login");
    store.add(data);
  	
  	writeToDebug ('Données enregistrées localement : [' + data['email'] + ']= ' + data['hash']);
    console.log("Données enregistrées localement :", data);
}

// Fonction pour envoyer les données au serveur
function sendDataToServer (data) {
	console.log ('sendDataToServer');
	
	writeToDebug ('sendDataToServer');

	var formData = new FormData();
    formData.append("id", data['id']);
    formData.append("lastname", data['nom']);
    formData.append("firstname", data['prenom']);
	
    fetch("save.php", {
        method: "POST",
		body: formData,
		//cache: false,
		dataType: 'json',
		processData: false, // Don't process the files
        contentType: false,        
    })
    .then((response) => {
        if (response.ok) {
            console.log("Données envoyées au serveur :", data);
		  	writeToDebug ('Données envoyéees au serveur : [' + data['id'] + '] ' + data['nom'] + ' ' + data['prenom']);
            // Supprimer les données envoyées de IndexedDB
            removeFromIndexedDB(data.id);
        } else {
            console.error("Erreur lors de l'envoi :", response.statusText);
        }
    })
    .catch((err) => {
        console.error("Échec de l'envoi :", err);
    });
}

// Supprimer un enregistrement d'IndexedDB après envoi
function removeFromIndexedDB(id) {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    store.delete(id);
    writeToDebug (`Donnée ID ${id} supprimée d'IndexedDB.`);
    console.log(`Donnée avec l'ID ${id} supprimée d'IndexedDB.`);
}

function removeLoginFromIndexedDB (id) {
    const transaction = db.transaction("login", "readwrite");
    const store = transaction.objectStore("login");
    store.delete(id);
    console.log(`Donnée avec l'ID ${id} supprimée d'IndexedDB.`);
}

// Synchroniser les données locales avec le serveur
function syncLocalData() {
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const getAllRequest = store.getAll();
    
    writeToDebug ('Appel syncLocalData');

    getAllRequest.onsuccess = function () {
        const unsyncedData = getAllRequest.result;
        unsyncedData.forEach((data) => {
            sendDataToServer(data);
        });
    };
}

function readLoginInfos (email, password) {
    const transaction = db.transaction("login", "readonly");
    const store = transaction.objectStore("login");
    const getAllRequest = store.getAll();
    
    console.log ('Appel readLoginInfos');

    getAllRequest.onsuccess = function () {
        const unsyncedData = getAllRequest.result;
        unsyncedData.forEach((data) => {
//        	removeLoginFromIndexedDB(1);
		    const hash = CryptoJS.SHA256 (password).toString();
            console.log (data.hash);
            if (hash == data.hash)
            	console.log ('Login validé');
        });
    };
}

// Gestionnaire de formulaire
/*document.getElementById("userForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const data = {
        id: Date.now(),
        nom: document.getElementById("nom").value,
        prenom: document.getElementById("prenom").value,
    };

    if (navigator.onLine) {
        sendDataToServer(data);
    } else {
        saveToIndexedDB(data);
    }
});
*/
// Gestionnaire de formulaire
/*document.getElementById("userLogin").addEventListener("click", function (event) {
    event.preventDefault();
	// Pour tester
	const login = {
	    email: 'stelafitte@gmail.com',
	    prenom: 'association2017',
	};

	saveLoginToIndexedDB (login);    
});
*/
// Vérification en ligne pour synchronisation automatique
//window.addEventListener("online", syncLocalData);
window.addEventListener("online", () => syncLocalData ('login'));


//sessionStorage.setItem("currentUser", "JaneDoe");
gGlobal['errorMessage'] = sessionStorage.getItem("errorMessage");
//document.location = "out/page-connexion.html";
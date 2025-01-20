const DB_NAME = 'UserDataDB';
const DB_VERSION = 2;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
  
      if (!db.objectStoreNames.contains("login")) {
          db.createObjectStore("login", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
      console.log("onsuccess");

      // Vérifier les données locales et les synchroniser dès que l'application s'ouvre
      if (navigator.onLine) {
          //syncLocalData('login');
      }      
    };

    request.onerror = (event) => {
      reject(event.target.error);
      console.error("Erreur lors de l'initialisation d'IndexedDB:", event.target.error);      
    };
  });
}

function updateData (storeName, key, updatedData) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.get(key); // Récupérer l'entrée existante
      request.onsuccess = () => {
        const data = request.result;

        if (data) {
          // Modifier les champs nécessaires
          Object.assign(data, updatedData);

          // Sauvegarder les données mises à jour
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve(`Data updated for key: ${key}`);
          updateRequest.onerror = (err) => reject(`Error updating data: ${err}`);
        } else {
          reject(`No data found for key: ${key}`);
        }
      };

    });
  });
}


function addData (storeName, data) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      console.log("Données enregistrées localement :", storeName, data);

      // Gérer le succès
      request.onsuccess = (event) => {
        console.log("Données enregistrées avec succès :", data);
        resolve(event.target.result); // Renvoie l'identifiant de l'enregistrement
      };

      // Gérer les erreurs
      request.onerror = (event) => {
        console.error("Erreur lors de l'enregistrement :", event.target.error);
        reject(event.target.error); // Rejette avec l'erreur capturée
      };
    });
  });
}

function getData (storeName, key) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      console.log(`Lire donnée ${key} dans d'IndexedDB.`, request);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

function removeData (storeName, key) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction (storeName, "readwrite");
      const store = transaction.objectStore (storeName);
      const request = store.delete (key);
      console.log(`Donnée avec l'ID ${key} supprimée d'IndexedDB.`);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
      transaction.oncomplete = function () {
            console.log("Transaction terminée.");
            db.close(); 
      };      
    });
  });
}

// Synchroniser les données locales avec le serveur
function syncLocalData (storeName) {
    const transaction = db.transaction (storeName, "readonly");
    const store = transaction.objectStore (storeName);
    const getAllRequest = store.getAll ();
    
    console.log ('Appel syncLocalData');

    getAllRequest.onsuccess = function () {
        const unsyncedData = getAllRequest.result;
        unsyncedData.forEach ((data) => {
            sendDataToServer (data);
        });
    };
}

function sendDataToServer (data) {
  console.log ('sendDataToServer');
  
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
            removeData ('login', data.id);
        } else {
            console.error("Erreur lors de l'envoi :", response.statusText);
        }
    })
    .catch((err) => {
        console.error("Échec de l'envoi :", err);
    });
}

//
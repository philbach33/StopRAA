// Importation de jsPDF
const { jsPDF } = window.jspdf;

// Création d'une fonction pour générer le PDF
function generatePDF() {
    const doc = new jsPDF();

    // Page 1 : Titre principal
    doc.setFontSize(16);
    doc.text("Dépistage scolaire des CRC en Polynésie française", 10, 10);
    doc.setFontSize(14);
    doc.text("Consultation de confirmation en cardiologie", 10, 20);

    // Section : Informations personnelles
    doc.setFontSize(12);
    doc.text("Nom : ________________________________________", 10, 40);
    doc.text("Prénom : _____________________________________", 10, 50);
    doc.text("Date de naissance : ___________________________", 10, 60);
    doc.text("Sexe :   F ☐   M ☐", 10, 70);

    doc.text("N° de DN : ______________________", 10, 80);
    doc.text("Régime CPS : ____________________", 10, 90);

    doc.text("Adresse (commune) : __________________________", 10, 100);
    doc.text("Date du dépistage : __________________________", 10, 110);
    doc.text("Lieu du dépistage : __________________________", 10, 120);

    doc.text("Souffle cardiaque :  Oui ☐ Non ☐", 10, 130);

    // Section : Antécédents
    doc.text("Antécédents personnels de douleur articulaire évocatrice de RAA :", 10, 140);
    doc.text("(date, durée, nombre, articulations atteintes, consultation médicale)", 10, 150);
    doc.text("_______________________________________________________________", 10, 160);

    doc.text("Antécédents familiaux de RAA : Non ☐ Oui ☐", 10, 170);
    doc.text("Précisez : ______________________________________", 10, 180);

    // Page 2 : Données échographiques
    doc.addPage();
    doc.setFontSize(12);
    doc.text("Données échographiques :", 10, 10);

    doc.setFontSize(10);
    doc.text("Commentaires : ________________________________________________", 10, 20);

    doc.setFontSize(12);
    doc.text("Définition et classification des atteintes valvulaires :", 10, 40);
    doc.setFontSize(10);
    doc.text("* Stade A : la PII peut être stoppée si ETT normale à 1-2 ans", 10, 50);
    doc.text("** Stades B, C, D : prophylaxie secondaire selon les recommandations", 10, 60);

    doc.text("Diagnostic de confirmation :", 10, 80);
    doc.text("Normal             Non pathologique/ Physiologique          Dystrophique/myxoïde", 10, 90);
    doc.text("Autre anomalie congénitale Préciser : ______________________", 10, 100);
    doc.text("CRC confirmée :      Stade A ☐ Stade B ☐ Stade C ☐ Stade D ☐", 10, 110);

    // Ajout du tableau des critères échographiques (exemple simplifié)
    const tableData1 = [
        ["", "Fuite pathologique (tous les critères doivent être réunis)", "Oui", "Non"],
        ["Valve mitrale", "Vue dans au moins deux incidences", "", ""],
        ["", "Jet ≥ 2 cm dans au moins une incidence (jet ≥ 1,5 cm si poids <30kg)", "", ""],
        ["", "Vitesse maximale ≥ 3m/sec pour une enveloppe complète", "", ""],
        ["", "Flux holosystolique dans au moins une enveloppe", "", ""],
        ["Valve aortique", "Vue sur deux incidences", "", ""],
        ["", "Jet ≥ 1 cm sur au moins une incidence", "", ""],
        ["", "Vitesse maximale≥ 3m/sec en protodiastole", "", ""],
        ["", "Flux holodiastolique dans au moins une enveloppe", "", ""],
    ];

    doc.autoTable({
        startY: 120,
        head: [tableData1[0]],
        body: tableData1.slice(1),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [200, 200, 200] },
    });

    // Page 3 : Traitement et suivi
    doc.addPage();
    doc.setFontSize(12);
    doc.text("Traitement et suivi proposés :", 10, 10);

    doc.setFontSize(10);
    doc.text("Surveillance échocardiographique : annuelle ☐ semestrielle ☐", 10, 20);
    doc.text("Pas de traitement ☐  BPG / 4 semaines ☐ BPG/ 3 semaines ☐ Oracilline ☐ Macrolide ☐", 10, 30);
    doc.text("Durée de PII recommandée : ____________________", 10, 40);

    doc.text("Demande de LM :   faite ☐   à faire ☐", 10, 60);
    doc.text("Déclaration obligatoire : faite ☐   à faire ☐", 10, 70);

    doc.text("Examen réalisé par : _____________________________________", 10, 90);
    doc.text("Signature et Tampon : ____________________________________", 10, 100);

    // Sauvegarde du PDF
    doc.save("formulaire_confirmation.pdf");
}

// Appel de la fonction pour générer le PDF
generatePDF();

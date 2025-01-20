line += interline;
numberOfLines = addHeaderTitle (doc, line, "Dépistage scolaire des CRC en Polynésie française");
line += (interline * numberOfLines);

numberOfLines = addHeaderTitle (doc, line, "Consultation de confirmation en cardiologie");
line += (interline * numberOfLines);

line += interline;
numberOfLines = addRowBold (doc, 10, line, "Nom: ", "lastname");
numberOfLines = addRowBold (doc, 110, line, "Prénom: ", "firstname");
line += (interline * numberOfLines);

numberOfLines = addRowBold (doc, 10, line, "Date de naissance (jj/mm/aaaa): ", "birth_date");
numberOfLines = addRowBoldSelect (doc, 110, line, "Sexe", "sexe", ["F","M",]);
line += (interline * numberOfLines);

numberOfLines = addRowBold (doc, 10, line, "Numéro de DN: ", "dn");
numberOfLines = addRowBold (doc, 110, line, "Régime CPS: ", "cps");
line += (interline * numberOfLines);

numberOfLines = addRowBold (doc, 10, line, "Adresse (commune): ", "address");
line += (interline * numberOfLines);

numberOfLines = addRowBold (doc, 10, line, "Date du dépistage (jj/mm/aaaa): ", "screening_date");
numberOfLines = addRowBold (doc, 110, line, "Lieu du dépistage: ", "screening_where");
line += (interline * numberOfLines);

numberOfLines = addRowBold (doc, 10, line, "Antécédents personnels de douleur articulaire évocatrice de RAA (date, durée, nombre, articulations atteintes, consultation médicale): ", "background");line += (interline * numberOfLines);

numberOfLines = addRowBoldRadio (doc, 10, line, "Antécédents familiaux de RAA: ", getInputValue ('back_raa'));
line += (interline * numberOfLines);

line += interline;
numberOfLines = addTitle (doc, line, "Données échographiques");
line += (interline * numberOfLines);

header =  [ { content: "Fuite pathologique (tous les critères doivent être réunis)", colSpan: 3 }];
rows = [ ["Valve mitrale", "IM vue dans au moins deux incidences ", getInputValue ('vm_im_view')],["", "Jet ≥ 2 cm dans au moins une incidence (jet ≥ 1,5cm si poids < 30kg)", getInputValue ('vm_jet_2cm')],["", "DCont : Vitesse maximale ≥ 3m/sec pour une enveloppe complète", getInputValue ('vm_dont_speed')],["", "DCont : Flux holosystolique dans au moins une enveloppe", getInputValue ('vm_dont_flow')],["Valve aortique", "IA vue sur deux incidences", getInputValue ('va_2views')],["", "Jet ≥ 1 cm sur au moins une incidence", getInputValue ('va_jet_1cm')],["", "DCont : Vitesse maximale≥ 3m/sec en protodiastole", getInputValue ('va_dont_speed')],["", "DCont : Flux holosystolique dans au moins une enveloppe", getInputValue ('va_dont_flow')],];
addTable (doc, line, header, rows);
line = (interline + doc.lastAutoTable.finalY);

header =  [ { content: "Sténose mitrale (tous les critères doivent être réunis)", colSpan: 3 }];
rows = [ ["", "Restriction des mouvements des feuillets et ouverture valvulaire limitée", getInputValue ('limited_valve_opening')],["", "Gradient moyen ≥ 4 mmHg", getInputValue ('average_gradient_4')],];
addTable (doc, line, header, rows);
line = (interline + doc.lastAutoTable.finalY);

header =  [ { content: "Critères morphologiques : un seul critère suffit chez les < 20 ans (2 critères nécessaires si ≥20 ans)", colSpan: 3 }];
rows = [ ["Valve mitrale", "Epaisseur de la valve antérieure ≥ 3 mm (en diastole)", getInputValue ('cm_vm_valve_thickness')],["", "Epaississement des cordages", getInputValue ('cm_vm_ropes_thickening')],["", "Restriction des mouvements des valves", getInputValue ('cm_vm_restriction_valve_movements')],["", "Mouvement excessif de l’extrémité de la grande valve durant la systole", getInputValue ('cm_vm_excessive_movement_valve')],["Valve aortique", "Epaississement des sigmoides", getInputValue ('cm_va_sigmoids_thickening')],["", "Prolapsus d’une sigmoide", getInputValue ('cm_va_sigmoid_prolapse')],["", "Restriction du mouvement des sigmoides", getInputValue ('cm_va_sigmoid_movements')],["", "Défaut de coaptation en diastole", getInputValue ('cm_va_failure_diastole')],];
addTable (doc, line, header, rows);
line = (interline + doc.lastAutoTable.finalY);

doc.addPage();
line = marginTop;
numberOfLines = addTitle (doc, line, "Définition et classification des atteintes valvulaires");
line += (interline * numberOfLines);

header =  [ { content: "Stade A : Critères échographiques minimum de CR (anciennement CRC limite)", colSpan: 3 }];
rows = [ ["Age", "< 20 ans uniquement", ""],["Risque évolutif", "Progression possible vers une cardiopathie valvulaire", ""],["Echographie", "Fuite pathologique légère mitrale ou aortique sans critères morphologiques", ""],["Conduite à tenir", "Envisager le traitement en fonction des antécédents familiaux et de l’histoire personnelle *", ""],];
addTable (doc, line, header, rows);
line = (interline + doc.lastAutoTable.finalY);

header =  [ { content: "Stade B : CRC légère **", colSpan: 3 }];
rows = [ ["Age", "Applicable à tout âge", ""],["Risque évolutif", "Risque modéré ou élevé de progression et risque de développer des symptômes de cardiopathie rhumatismale", ""],["Echographie", "Fuite valvulaire pathologique légère + 1 critère morphologique si âge ≤20 ans (+ 2 critères morphologiques si âge > 20 ans)<br><b>ou</b><br>IM légère + IA légère", ""],];
addTable (doc, line, header, rows);
line = (interline + doc.lastAutoTable.finalY);

header =  [ { content: "Stade C : CRC avérée à risque de complications cliniques **", colSpan: 3 }];
rows = [ ["Age", "Applicable à tout âge", ""],["Risque évolutif", "Haut risque de complications cliniques nécessitant un traitement médical et/ou chirurgical", ""],["Echographie", "Caractéristiques échographiques : IM modérée ou sévère, IA modérée ou sévère, sténose mitrale, hypertension pulmonaire, fonction systolique du VG diminuée", ""],];
addTable (doc, line, header, rows);
line = (interline + doc.lastAutoTable.finalY);

header =  [ { content: "Stade D : CRC sévère avec complications cliniques **", colSpan: 3 }];
rows = [ ["Age", "Applicable à tout âge", ""],["Risque évolutif", "Complications incluant insuffisance cardiaque congestive, chirurgie, arythmie, AVC, endocardite infectieuse", ""],["Echographie", "Fuite mitrale modérée/sévère, fuite aortique modérée/sévère, sténose mitrale ou aortique, hypertension pulmonaire, fonction VG diminuée", ""],];
addTable (doc, line, header, rows);
line = (interline + doc.lastAutoTable.finalY);

doc.addPage();
line = marginTop;
numberOfLines = addSubTitle (doc, line, "Diagnostic: ");
line += (interline * numberOfLines) + 1;

numberOfLines = addRowBoldSelect (doc, 10, line, "Diagnostic de confirmation", "diagnostic", ["Normal","CRC","Non pathologique/Physiologique","Dystrophique/myxoïde",]);
line += (interline * numberOfLines);

numberOfLines = addRowBoldSelect (doc, 10, line, "Groupage CRC", "crc", ["A","B","C","D",]);
line += (interline * numberOfLines);

numberOfLines = addRowBoldRadio (doc, 10, line, "Autre anomalie congénitale: ", getInputValue ('other_congenital_anomaly'));
line += (interline * numberOfLines);

line += interline;
numberOfLines = addSubTitle (doc, line, "Traitement et suivi proposé: ");
line += (interline * numberOfLines) + 1;

numberOfLines = addRowBoldSelect (doc, 10, line, "Surveillance échocardiographique", "surveillance_echo", ["Annuelle","Semestrielle",]);
line += (interline * numberOfLines);

numberOfLines = addRowBoldSelect (doc, 10, line, "Traitement", "traitement", ["Pas de traitement","BPG / 4 semaines","BPG / 3 semaines","Oracilline","Macrolide",]);
line += (interline * numberOfLines);

numberOfLines = addRowBold (doc, 10, line, "Durée de PII recommandée: ", "duree_pii");line += (interline * numberOfLines);


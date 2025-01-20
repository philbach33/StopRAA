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


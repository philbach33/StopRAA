line = marginTop;
numberOfLines = addSubTitle (doc, line, "Diagnostic: ");
line += (interline * numberOfLines) + 1;

numberOfLines = addRowBoldSelect (doc, 10, line, "Diagnostic de confirmation", "diagnostic", ["Normal","CRC","Non pathologique/Physiologique","Dystrophique/myxoïde",]);
line += (interline * numberOfLines);

line += interline;
numberOfLines = addRowBoldSelect (doc, 10, line, "Groupage CRC", "crc", ["Sans objet","A","B","C","D",]);
line += (interline * numberOfLines);

line += interline;
numberOfLines = addRowBoldRadio (doc, 10, line, "Autre anomalie congénitale: ", getInputValue ('other_congenital_anomaly'));
line += (interline * numberOfLines);

line += interline;
line += interline;
numberOfLines = addSubTitle (doc, line, "Traitement et suivi proposé: ");
line += (interline * numberOfLines) + 1;

numberOfLines = addRowBoldSelect (doc, 10, line, "Surveillance échocardiographique", "surveillance_echo", ["Annuelle","Semestrielle",]);
line += (interline * numberOfLines);

line += interline;
numberOfLines = addRowBoldSelect (doc, 10, line, "Traitement", "traitement", ["Pas de traitement","BPG / 4 semaines","BPG / 3 semaines","Oracilline","Macrolide",]);
line += (interline * numberOfLines);

line += interline;
numberOfLines = addRowBold (doc, 10, line, "Durée de PII recommandée: ", "duree_pii");line += (interline * numberOfLines);


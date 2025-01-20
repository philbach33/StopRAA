const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { promisify } = require('util');
const dirSrc = 'html';
const dirOut = 'out';
const rootPath = '/raa/';
const page = 'connexion';

//const jsonString = '[{"page": "connexion", "scripts": ["connexion.js", "toto.js"], "styles":["connexion.css"]}]';

// Transformation de la chaîne JSON en objet JavaScript
//const pagesObject = JSON.parse (jsonString);

// Fichiers source
const headFile = path.join(dirSrc, 'common-head.html');

// Fonction pour ajouter la ligne dans le head
function modifyHeadContentScripts (headContent, scripts) {
	var timestamp = Date.now();
    //const linkTag = '\t<link rel="stylesheet" type="text/css" href="../css/connexion.css" />';
    var scriptTag = '\t<script type="text/javascript" src="' + rootPath + 'script/' + scripts + '?t=' + timestamp + '"></script>';

    // Trouver la position de </head> et ajouter la ligne avant
    var headEndIndex = headContent.indexOf('</head>');
    if (headEndIndex !== -1) {
        // Ajouter la ligne avant </head>
        return headContent.slice(0, headEndIndex) + scriptTag + '\n' + headContent.slice(headEndIndex);
    } else {
        // Si </head> n'est pas trouvé, renvoyer le contenu original
        console.error('Balise </head> non trouvée dans le fichier head.html');
        return headContent;
    }
}

// Fonction pour ajouter la ligne dans le head
function modifyHeadContentStyles (headContent, styles) {
    var timestamp = Date.now();
    var linkTag = '\t<link rel="stylesheet" type="text/css" href="' + rootPath + 'css/' + styles + '?t=' + timestamp + '"/>';

    // Trouver la position de </head> et ajouter la ligne avant
    var headEndIndex = headContent.indexOf('</head>');
    if (headEndIndex !== -1) {
        // Ajouter la ligne avant </head>
        return headContent.slice(0, headEndIndex) + linkTag + '\n' + headContent.slice(headEndIndex);
    } else {
        // Si </head> n'est pas trouvé, renvoyer le contenu original
        console.error('Balise </head> non trouvée dans le fichier head.html');
        return headContent;
    }
}

// Fonction pour remplacer les variables {VAR} dans le contenu HTML
function replaceVariablesInHTMLPromise(inputFilePath, outputFilePath, data) {
    return new Promise((resolve, reject) => {
        fs.readFile(inputFilePath, "utf8", (err, content) => {
            if (err) {
                console.error("Erreur de lecture du fichier :", err);
                return reject(err);
            }

            let updatedContent = content.replace(/\{(.*?)\}/g, (match, variable) => {
                return data[variable] || match; // Remplace par la valeur ou laisse tel quel si non trouvé
            });

            updatedContent = updatedContent.replace(/{ROOT}/g, rootPath);

            fs.writeFile(outputFilePath, updatedContent, "utf8", err => {
                if (err) {
                    console.error("Erreur d'écriture du fichier :", err);
                    return reject(err);
                }
                console.log(`Fichier avec VARIABLES mis à jour écrit avec succès : ${outputFilePath}`);
                resolve(); // Signaler la réussite
            });
        });
    });
}

function replaceIncludeInFilePromise(inputFilePath, outputFilePath, replaceValue) {
    return new Promise((resolve, reject) => {
        fs.readFile(inputFilePath, "utf8", (err, content) => {
            if (err) {
                console.error("Erreur de lecture du fichier :", err);
                return reject(err);
            }

            let updatedContent = content.replace(/<!--\s*INCLUDE\s+(\w+)\s*-->/g, (match, variable) => {
                return replaceValue[variable] || match; // Remplace par la valeur ou laisse tel quel si non trouvé
            });

            fs.writeFile(outputFilePath, updatedContent, "utf8", err => {
                if (err) {
                    console.error("Erreur d'écriture du fichier :", err);
                    return reject(err);
                }
                console.log(`Fichier avec INCLUDES écrit avec succès : ${outputFilePath}`);
                resolve(); // Signaler la réussite
            });
        });
    });
}

// Fonction pour traiter un fichier et remplacer les occurrences de {ROOT}
function replaceRootInFile (inputFilePath, outputFilePath, replacementValue) {
  // Lire le fichier en tant que texte brut
  fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Erreur lors de la lecture du fichier : ${err.message}`);
      return;
    }

    // Remplacer {ROOT} par la valeur souhaitée
    const updatedContent = data.replace(/{ROOT}/g, replacementValue);

    // Enregistrer le contenu mis à jour dans un nouveau fichier
    fs.writeFile(outputFilePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(`Erreur lors de l'écriture du fichier : ${err.message}`);
        return;
      }

      console.log(`Fichier mis à jour avec succès : ${outputFilePath}`);
    });
  });
}

// Fonction pour concaténer les fichiers
function concatHtmlFiles (file1, file2, styles, scripts, output) {
    try {
        // Lire le contenu des fichiers
        const headContent = fs.readFileSync(file1, 'utf-8');
        const connexionContent = fs.readFileSync(file2, 'utf-8');

        var modifiedHeadContent = headContent;

        // Modifier le contenu du head
        styles.forEach (style => {
            modifiedHeadContent = modifyHeadContentStyles (modifiedHeadContent, style);
        });

        scripts.forEach (script => {
            modifiedHeadContent = modifyHeadContentScripts (modifiedHeadContent, script);
        });


        // Concaténer les contenus
        const combinedContent = `${modifiedHeadContent}\n${connexionContent}`;

        // Écrire dans le fichier de sortie
        fs.writeFileSync(output, combinedContent, 'utf-8');

        console.log(`Fichier généré : ${output}`);
    } catch (err) {
        console.error('Erreur lors de la concaténation :', err);
    }
}

// Déclare l'objet AppData globalement
const AppData = {};

// Fonction pour charger les paramètres
function loadParameters() {
    return new Promise((resolve, reject) => {
        fs.readFile('assets/parameters.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Erreur de lecture du fichier:', err);
                reject(err);
                return;
            }

            console.log('Lecture du fichier de paramètres réussie');

            try {
                const variables = JSON.parse(data);

                // Parcours et insertion dans AppData
                variables.forEach(item => {
                    for (const key in item) {
                        if (item.hasOwnProperty(key)) {
                            AppData[key] = item[key];
                        }
                    }
                });

                resolve(AppData); // Résout la promesse avec les données
            } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                reject(parseError);
            }
        });
    });
}

// Fonction pour charger des variables 
function loadVariables() {
    return new Promise((resolve, reject) => {
        fs.readFile('messages.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Erreur de lecture du fichier:', err);
                reject(err);
                return;
            }

            console.log('Lecture du fichier de paramètres réussie');

            try {
                const variables = JSON.parse(data);

                // Parcours et insertion dans AppData
			    Object.keys(variables).forEach(key => {
	                AppData[variables[key].name] = variables[key].msg;
                });

                resolve(AppData); // Résout la promesse avec les données
            } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                reject(parseError);
            }
        });
    });
}

// Ajout d'un champs de type radio
function insertRadioboxBoolean (html, row, tab) {

	let classEmpty = '';
	let checked_ok = '';
	let checked_ko = '';

	if (row.empty == true)	
		classEmpty = 'empty';

	// Init valeur
	if (row.value) {
		if (row.value == 'ok')
			checked_ok = 'checked';
		if (row.value == 'ko')
			checked_ko = 'checked';		
	}

	html += tab + `<div class="row">\n`;
	html += tab + `\t<span>${row.label}</span>\n`;
	html += tab + `\t<div class="radio-cols">\n`;
	html += tab + `\t\t<label class="radiobox">\n`;
	html += tab + `\t\t\t<input type="radio" class="${classEmpty}" ${checked_ok} value="ok" name="${row.variable}"/>\n`;
	html += tab + `\t\t\t<span class="checkmark"></span><span>Oui</span>\n`;
	html += tab + `\t\t</label>\n`;
	html += tab + `\t\t<label class="radiobox">\n`;
	html += tab + `\t\t\t<input type="radio" class="${classEmpty}" ${checked_ko} value="ko" name="${row.variable}"/>\n`;
	html += tab + `\t\t\t<span class="checkmark"></span><span>Non</span>\n`;
	html += tab + `\t\t</label>\n`;
	html += tab + `\t</div>\n`;
	if (row.detail && row.detail == true) {
		html += tab + `\t<div class="detail">\n`;
		html += tab + `\t\t<label class="before">Précisez:</label>\n`;
		html += tab + `\t\t<textarea class="empty" name="${row.variable}_detail" name="${row.variable}_detail" id="${row.variable}_detail"></textarea>\n`;
		html += tab + `\t</div>\n`;
	}
	html += tab + `</div>\n`;
	return html;
}

// Ajout d'un champs de type radio
function insertRadioboxFlexBoolean (html, row, tab) {

	let classEmpty = '';
	let checked_ok = '';
	let checked_ko = '';

	if (row.empty == true)	
		classEmpty = 'empty';

	// Init valeur
	if (row.value) {
		if (row.value == 'ok')
			checked_ok = 'checked';
		if (row.value == 'ko')
			checked_ko = 'checked';		
	}

	html += tab + `<div class="row-flex">\n`;
	html += tab + `\t<span>${row.label}</span>\n`;

	html += tab + `\t<label class="radiobox">\n`;
	html += tab + `\t\t<input type="radio" class="${classEmpty}" ${checked_ok} value="ok" name="${row.variable}"/>\n`;
	html += tab + `\t\t<span class="checkmark"></span>\n`;
	html += tab + `\t</label>\n`;
	html += tab + `\t<label class="radiobox">\n`;
	html += tab + `\t\t<input type="radio" class="${classEmpty}" ${checked_ko} value="ko" name="${row.variable}"/>\n`;
	html += tab + `\t\t<span class="checkmark"></span>\n`;
	html += tab + `\t</label>\n`;
	html += tab + `</div>\n`;
	return html;
}

// Charger les paramètres et afficher une valeur
loadParameters ()
    .then(() => {
    })
    .catch(error => {
        console.error('Erreur lors du chargement des paramètres :', error);
    });

// Charger les variables
loadVariables ()
    .then(() => {
    })
    .catch(error => {
        console.error('Erreur lors du chargement des paramètres :', error);
    });

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Déclare l'objet AppData globalement
const Includes = {};

// Lire le fichier JSON
fs.readFile('form.json', 'utf8', (err, data) => {

    if (err) {
        console.error('Erreur de lecture du fichier:', err);
        return;
    }

    console.log ('Lecture du fichier des forms réussie');

    const pagesObject = JSON.parse(data);
    let html = '';
    let firstPage = true;
    Object.keys(pagesObject).forEach(key => {
        
        let pageCount = pagesObject[key].page;
        let pageTitle = pagesObject[key].title;
        console.log ('lecture de la page', pageCount, pageTitle)
        if (firstPage) {
			html = `<div class="page activate" id="page-${pageCount}">\n`;
			firstPage = false;
        }
        else
			html = `<div class="page" id="page-${pageCount}">\n`;
		
		html += `\t\t<h1>${pageTitle}</h1>\n`;

		if (pagesObject[key].subtitle)
			html += `\t\t<h2>${pagesObject[key].subtitle}</h2>\n`;

	    Object.keys(pagesObject[key].rows).forEach(rowKey => {
	    	let row = pagesObject[key].rows[rowKey];
	    	if (row.type == 'text') {
	    		html += '\t\t';
	    		if (row.empty == 'true')
	    			html += `<div class="row no-border empty"><span>${row.label}</span><input type="text" name="${row.variable}" value =""/></div>\n`;
	    		else
	    			html += `<div class="row no-border"><span>${row.label}</span><input type="text" name="${row.variable}" value =""/></div>\n`;
	    	}
	    	else if (row.type == 'select') {
	    		html += '\t\t';
	    		html += `<div class="row no-border">\n`;
	    		html += `\t\t\t<span>${row.label}</span>\n`;
	    		if (row.empty == true)
	    			html += `\t\t\t<select class="empty" name="${row.variable}">\n`
	    		else
	    			html += `\t\t\t<select name="${row.variable}">\n`
	    		Object.keys(row.options).forEach(rowOption => {
	    			html += `\t\t\t\t<option value="${row.options[rowOption].value}">${row.options[rowOption].label}</option>\n`;
	    		});
	    		html += `\t\t\t</select>\n`
	    		html += `\t\t</div>\n`;	    		
	    	}
	    	else if (row.type == 'textarea') {
	    		html += '\t\t';
	    		let classEmpty = row.empty==true?'empty':'';
	    		html += `<div class="row no-border"><span>${row.label}</span><textarea rows="4" class="${classEmpty}" name="${row.variable}" id="${row.variable}"></textarea></div>\n`;
	    	}
	    	else if (row.type == 'radio' && row.options == 'boolean') {
		   		html = insertRadioboxBoolean (html, row, '\t\t');
	    	}
	    	else if (row.type == 'box') {
	    		html += `\t\t<div class="box">\n`;
	    		if (row.title)
	    			html += `\t\t\t<div class="title">${row.title}</div>\n`;
	    		if (row.subtitle)
		    		html += `\t\t\t<h3><span>${row.subtitle}</span><span>Oui</span><span>Non</span></h3>\n`;
	    		Object.keys(row.rows).forEach(rowRow => {
			    	let rowBox = row.rows[rowRow];
	    			if (rowBox.type == 'radio' && rowBox.options == 'boolean')
			    		html = insertRadioboxFlexBoolean (html, rowBox, '\t\t\t', true);
			    	else if (rowBox.type == 'subtitle') {
			    		html += `\t\t\t<h3><span>${rowBox.text}</span><span>Oui</span><span>Non</span></h3>\n`;
	    			}
	    			else if (rowBox.type == 'html') {
	    				html += `\t\t\t${rowBox.value}\n`;	
	    			}
	    		});

	    		html += `\t\t</div>\n`;
	    	}
	    });
		
		html += `\t\t<div class="navigation">\n`;
		html += `\t\t\t<button class="button last-page">{BUTTON_LAST}</button>\n`;
		if (pagesObject[key].callback)
			html += `\t\t\t<button class="button next-page" data-callback="${pagesObject[key].callback}">{BUTTON_NEXT}</button>\n`;
		else
			html += `\t\t\t<button class="button next-page">{BUTTON_NEXT}</button>\n`;
		html += `\t\t</div>\n`;
   		html += `\t</div>\n`;
        Includes['PAGE' + pageCount] = html;
    });
});

// ******************************
// Page PDF
// ******************************
const dataFile1 = JSON.parse(fs.readFileSync('form.json', 'utf-8'));
const dataFile2 = JSON.parse(fs.readFileSync('assets/pdf.json', 'utf-8'));

var pdfHtml = '<div class="page-pdf">\n';
var pdfPDF = '';

dataFile2.forEach (page2 => {
	if (page2.type == 'header-title') {
		pdfPDF += `numberOfLines = addHeaderTitle (doc, line, "${page2.value }");\n`;	
		pdfPDF += `line += (interline * numberOfLines);\n\n`;
	}
	else if (page2.type == 'saut-de-page') {
		pdfPDF += 'doc.addPage();\n';
		pdfPDF += 'line = marginTop;\n';
	}
	else if (page2.type == 'saut-de-ligne') {
		pdfPDF += 'line += interline;\n';
	}
	else if (page2.type == 'row') {
		pdfHtml += '\t\t<div class="row">\n';
		var col = 10;
		page2.values.forEach (variable => {
			dataFile1.forEach(page1 => {
			    if (page1.rows) {
			        page1.rows.forEach(row => {
			            if (row.variable === variable) {
			            	if (row.type == 'text') {
								pdfHtml += `\t\t\t<div class="gras" id="${row.variable}">${row.label} : <span></span></div>\n`;
								pdfPDF += `numberOfLines = addRowBold (doc, ${col}, line, "${row.label}: ", "${row.variable}");\n`;
			            	}
			            	if (row.type == 'textarea') {
								pdfHtml += `\t\t\t<div class="textarea" name="${row.variable}" id="${row.variable}">${row.label} : <br/><span></span></div>\n`;
								pdfPDF += `numberOfLines = addRowBold (doc, ${col}, line, "${row.label}: ", "${row.variable}");`;
			            	}
			            	if (row.type == 'radio') {
								pdfHtml += `\t\t\t<div id="${row.variable}">${row.label} : <span class="gras"></span></div>\n`;
								pdfPDF += `numberOfLines = addRowBoldRadio (doc, ${col}, line, "${row.label}: ", getInputValue ('${row.variable}'));\n`;
			            	}
			            	if (row.type == 'select') {
								pdfHtml += `\t\t\t<div id="${row.variable}">${row.label} : <br/><span></span></div>\n`;
								var select = '[';
								row.options.forEach (option => {
									if (option.value != "0")
										select += `"${option.label}",`; 
								});
								select +=']';
								pdfPDF += `numberOfLines = addRowBoldSelect (doc, ${col}, line, "${row.label}", "${row.variable}", ${select});\n`;
			            	}
			            }
			        });
			    }
			});
			col += 100;
		});
		pdfHtml += '\t\t</div>\n';
		pdfPDF += `line += (interline * numberOfLines);\n\n`;
	}
	else if (page2.type == 'title') {
		pdfHtml += `\t\t<h2>${page2.value}</h2>\n`;
		pdfPDF += `numberOfLines = addTitle (doc, line, "${page2.value}");\n`;	
		pdfPDF += `line += (interline * numberOfLines);\n\n`;
	}
	else if (page2.type == 'subtitle') {
		pdfHtml += `\t\t<h2>${page2.value}</h2>\n`;
		pdfPDF += `numberOfLines = addSubTitle (doc, line, "${page2.value}");\n`;	
		pdfPDF += `line += (interline * numberOfLines) + 1;\n\n`;
	}
	else if (page2.type == 'table') {
		if (page2.class)
			pdfHtml += `\t\t<div class="table ${page2.class}">\n`;
		else
			pdfHtml += '\t\t<div class="table">\n';
	
		pdfPDF += `header =  [ { content: "${page2.title}", colSpan: 3 }];\n`;
		pdfHtml += `\t\t\t<div class="title">${page2.title}</div>\n`;

		pdfPDF += `rows = [ `;
		page2.rows.forEach (line => {
			var label = 'undefined';
			if (line.variable) {
				dataFile1.forEach(page1 => {
				    if (page1.rows) {
				        page1.rows.forEach (rowForm => {
				        	if (rowForm.type == 'box') {
						        rowForm.rows.forEach (rowBox => {
						            if (rowBox.variable === line.variable) {
						            	label = rowBox.label;
						            }
						        });
				        	}
				    	});
					}			
		    	});

		    	pdfPDF += `["${line.title}", "${label}", getInputValue ('${line.variable}')],`;
				pdfHtml += `\t\t\t<div class="line"><div>${line.title}</div><div>${label}</div><div class="value"></div></div>\n`;
			}
			if (line.text) {
				label = line.text;
		    	pdfPDF += `["${line.title}", "${label}", ""],`;				
				pdfHtml += `\t\t\t<div class="line"><div>${line.title}</div><div>${label}</div></div>\n`;
			}
		});
		pdfPDF += `];\n`;	
 		pdfPDF += `addTable (doc, line, header, rows);\n`;
 		pdfPDF += `line = (interline + doc.lastAutoTable.finalY);\n\n`;


		pdfHtml += '\t\t</div>\n';
	}
});
pdfHtml += '\t</div>\n';	
Includes['PAGEPDF'] = pdfHtml;

// ******************************
// Création des pages formulaires
// ******************************
fs.readFile('config.json', 'utf8', (err, data) => {

    if (err) {
        console.error('Erreur de lecture du fichier:', err);
        return;
    }

    console.log ('Lecture du fichier de configuration réussie');

    const pagesObject = JSON.parse(data);
    Object.keys(pagesObject).forEach(key => {
        
        let page = pagesObject[key].page;
        let htmlFile = path.join(dirSrc, page + '.html');

        let outputFile = path.join(dirOut, 'page-' + page + '.html');

        concatHtmlFiles (headFile, htmlFile, pagesObject[key].styles, pagesObject[key].scripts, outputFile);

	    replaceIncludeInFilePromise(outputFile, outputFile, Includes)
	        .then(() => {
	            console.log('replaceIncludeInFile terminé');
	            return replaceVariablesInHTMLPromise(outputFile, outputFile, AppData);
	        })
	        .then(() => {
	            console.log('replaceVariablesInHTML terminé');
	        })
	        .catch(err => {
	            console.error('Erreur lors du traitement :', err);
	        });
    });

});


fs.writeFileSync ('out/pdf-0.js', pdfPDF, 'utf-8');

// Chemin du fichier source
const inputFilePath = 'out/pdf-0.js';

// Variables pour le traitement
let currentFileIndex = 1; // Index du fichier en cours
let currentWriteStream = null; // Flux d'écriture en cours
let currentDocReplacement = 'doc1'; // Remplacement actuel de "doc"

// Fonction pour créer un nouveau fichier et flux d'écriture
function createNewFile() {
  if (currentWriteStream) {
    currentWriteStream.end(); // Fermer l'ancien flux
  }
  const outputFilePath = `out/pdf-${currentFileIndex}.js`;
  currentWriteStream = fs.createWriteStream(outputFilePath);
  console.log(`Création du fichier : ${outputFilePath}`);
  currentDocReplacement = `doc${currentFileIndex}`; // Mettre à jour le remplacement de "doc"
  currentFileIndex++;
}

// Initialiser le premier fichier
createNewFile();

// Interface de lecture ligne par ligne
const rl = readline.createInterface({
  input: fs.createReadStream (inputFilePath, 'utf8'),
});

// Lire chaque ligne
rl.on('line', (line) => {
  // Si la ligne contient "addPage", créer un nouveau fichier
  if (line.includes('addPage')) {
    createNewFile();
    return;
  }
  // Remplacer "doc" par le remplacement actuel et écrire dans le fichier en cours
  // const modifiedLine = line.replace(/doc/g, currentDocReplacement);
  // currentWriteStream.write(modifiedLine + '\n');
  currentWriteStream.write(line + '\n');
});

// Lorsque la lecture est terminée
rl.on('close', () => {
  if (currentWriteStream) {
    currentWriteStream.end(); // Fermer le dernier flux
  }
  console.log('Traitement terminé.');
});

rl.on('error', (err) => {
  console.error('Erreur lors de la lecture du fichier :', err);
});


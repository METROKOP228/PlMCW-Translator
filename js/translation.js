// ПЕРЕКЛАД ВНУТРІШНЬОІГРОВИХ НАЗВ

function translateNames() {
    let text = editor2.getValue();

    output2.setValue(translateJava(text));
    return;
}

// Don't even try to optimize
function translateJava(text) {
    console.log(text)
    text = text.split("\n");
    let en_uk = [];
    try {
        for (let i = 0; i < text.length; i++) {
            let matches = [];
            if (text[i].includes("[[File:") || text[i].includes("[[Файл:")) {
                matches = text[i].match(/\[\[(File|Файл):[^\]]*\]\]/g);
                for (let j = 0; j < matches.length; j++) {
                    for (let match of matches) {
                        text[i] = text[i].replace(match, 'ЗАМІНИТИ');
                    }
                }
            }
            for (let j = 0; j < translations_java[jeVer].length; j++) {
                en_uk = translations_java[jeVer][j];

                let patternTJ = new RegExp(en_uk[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                text[i] = text[i].replace(patternTJ, en_uk[1]);
            }
            if (matches.length > 0) {
                for (let match of matches) {
                    text[i] = text[i].replace('ЗАМІНИТИ', match);
                }
            }
        }
        text = text.join("\n");
        return text;
    } catch (error) {
        console.error(error);
        return text;
    }
}











// ПОШУК СЕРЕД ВНУТРІШНЬОІГРОВИХ НАЗВ

var isGlobal;
var useRegex;
var caseSensitive;

function searchMatches() {
    //isGlobal = document.getElementById("global-search").checked;
    isGlobal = true;
    useRegex = document.getElementById("regex-search").checked;
    caseSensitive = document.getElementById("cs-search").checked;
    console.log(`Global: ${isGlobal}, regex: ${useRegex}, case sensitive: ${caseSensitive}`);
    searchInArrays(translations_java[jeVer2]);
    return;
}

function searchInArrays(arrayJ) {
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = ""; // Clear previous results
    const text = document.getElementById("text-to-search").value;
    let matches = [];
    let matches2 = [];
    let matches3 = [];
    let matches4 = [];
    let matches5 = [];

    if (text !== "") {
        let regex;
        if (useRegex) {
            try {
                regex = new RegExp(text, caseSensitive ? 'g' : 'gi');
            } catch (e) {
                console.error("Invalid regular expression: ", e);
                return;
            }
        }

        const searchAndHighlight = (el, arrayName, arrays=false) => {
            // Визначаємо регулярний вираз для пошуку
            const flags = caseSensitive ? 'g' : 'gi';
            const searchRegex = useRegex ? regex : new RegExp(text, flags);

            // Перевіряємо, чи знайдений збіг
            let matchFound;
            if (arrays) {
                for (let elel of el) {
                    matchFound = useRegex 
                        ? regex.test(elel) 
                        : (caseSensitive ? elel.includes(text) : elel.toLowerCase().includes(text.toLowerCase()));
                    if (matchFound) {
                        break;
                    }
                }
            } else {             
                matchFound = useRegex 
                    ? regex.test(el) 
                    : (caseSensitive ? el.includes(text) : el.toLowerCase().includes(text.toLowerCase()));
            }

            if (matchFound) {
                let els;
                els = arrays ? el : el.split("=");
                
                // Підсвічуємо всі збіги в частинах елемента
                const replaceParts = els.map(part => 
                    part.replace(searchRegex, match => `<span class="highlight-search">${match}</span>`)
                );

                // Екрануємо `, " і \ в текстах els[0] та els[1]
                let escapedEls0 = els[0].replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`');
                let escapedEls1 = els[1].replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`');

                // Формуємо відформатований HTML з екранованими символами
                let processedEl;
                if (arrays) {
                    processedEl = `<span class="changesHover" onclick="(() => copyText(\`${escapedEls0}\`))();">${replaceParts[0]}</span> <span class="arrow"> --&gt; </span> <span class="changesHover" onclick="(() => copyText(\`${escapedEls1}\`))();">${replaceParts[1]}</span> <small class="changesHover" onclick="(() => copyText(\`${els[2]}\`))();">(${replaceParts[2]})</small><hr>`;
                } else {
                    processedEl = `<span class="changesHover" onclick="(() => copyText(\`${escapedEls0}\`))();">${replaceParts[0]}</span> <span class="arrow"> --&gt; </span> <span class="changesHover" onclick="(() => copyText(\`${escapedEls1}\`))();">${replaceParts[1]}</span><hr>`;
                }
                // Додаємо до масиву результатів
                arrayName.push(processedEl);

                // Відображаємо результат у контейнері результатів
                let resultElement = document.createElement('div');
                resultElement.innerHTML = processedEl;
                resultsContainer.appendChild(resultElement);
            }
        };
        let element = '<span style="font-size: 25px;" id="mcjeText">Java Edition:</span>';
        let resultElement = document.createElement('div');
        resultElement.innerHTML = element;
        resultsContainer.appendChild(resultElement);
        for (let i = 0; i < arrayJ.length; i++) {
            searchAndHighlight(arrayJ[i], matches, true);
        }
        if (matches[0] === undefined) {
            document.getElementById('mcjeText').classList.add('hidden');
        } else {
            document.getElementById('mcjeText').classList.remove('hidden');
        }
    }
}







// ПОРІВНЯННЯ ІГРОВИХ ФАЙЛІВ

function parse_lines(lines, arrays=false) {
    parsed_dict = {};

    if (arrays) {
        for (const line of lines) {
            let key = line[2].trim();
            let valueEn = line[0].trim();
            let valueUk = line[1].trim();
            parsed_dict[key] = { en: valueEn, uk: valueUk};
        }
    } else {
        for (const line of lines) {
            if (line.includes('=')) {
                let [key, value] = line.split('=', 2);
                parsed_dict[key.trim()] = value.trim();
            }
        }
    }
    return parsed_dict;
}

function find_new_lines(old_dict, new_dict) {
    const new_lines = {};
    for (const key in new_dict) {
        if (!(key in old_dict)) {
            new_lines[key] = new_dict[key];
        }
    }
    return new_lines;
}

function find_changed_lines(old_dict, new_dict, java) {
    const changed_lines = {};
    for (const key in new_dict) {
        if (key in old_dict) {
            if (java) {
                if (old_dict[key].uk !== new_dict[key].uk) {
                    changed_lines[key] = `<span class="changesHover" onclick="copyText((() => copyText(\`${old_dict[key].uk}\`))(););">${old_dict[key].uk}</span> <span class="arrow"> --&gt; </span> <span class="changesHover" onclick="(() => copyText(\`${new_dict[key].uk}\`))();">${new_dict[key].uk}</span>`;
                }
            } else {
                if (old_dict[key] !== new_dict[key]) {
                    changed_lines[key] = `<span class="changesHover" onclick="copyText((() => copyText(\`${old_dict[key]}\`))(););">${old_dict[key]}</span> <span class="arrow"> --&gt; </span> <span class="changesHover" onclick="(() => copyText(\`${new_dict[key]}\`))();">${new_dict[key]}</span>`;
                }
            }
        }
    }
    return changed_lines;
}

function find_removed_lines(old_dict, new_dict) {
    const removed_lines = {};
    for (const key in old_dict) {
        if (!(key in new_dict)) {
            removed_lines[key] = old_dict[key];
        }
    }
    return removed_lines;
}

function insert_changes(new_lines, changed_lines, removed_lines, java) {
    let compareText = '<br><br><span style="font-size: 25px;" >Nowe ciągi:</span><br>';

    if (java) {

        for (const key in new_lines) {
            const { en, uk } = new_lines[key]; // Деструктуризація об'єкта
            compareText += `<span class="changesHover" onclick="(() => copyText(\`${en}\`))();">${en}</span> 
            <span class="arrow"> --&gt; </span> 
            <span class="changesHover" onclick="(() => copyText(\`${uk}\`))();">${uk}</span> 
            <small class="changesHover" onclick="(() => copyText(\`${key}\`))();">(${key})</small><br><hr>`;
        }
        compareText += '<br><span style="font-size: 25px;">Zmienione ciągi:</span><br>';
        const sortedChangedLines = Object.entries(changed_lines)
            .sort((a, b) => b[1].length - a[1].length);

        for (const [key, value] of sortedChangedLines) {
            compareText += `<span class="arrow">${key}:</span> ${value}<br><hr>`;
        }

        compareText += '<br><span style="font-size: 25px;">Usunięte ciągi:</span><br>';


        for (const key in removed_lines) {
            const { en, uk } = removed_lines[key]; // Деструктуризація об'єкта
            compareText += `<span class="changesHover" onclick="(() => copyText(\`${en}\`))();">${en}</span> 
            <span class="arrow"> --&gt; </span> 
            <span class="changesHover" onclick="(() => copyText(\`${uk}\`))();">${uk}</span> 
            <small class="changesHover" onclick="(() => copyText(\`${key}\`))();">(${key})</small><br><hr>`;
        }
    } else {
        const sortedNewLines = Object.entries(new_lines)
            .sort((a, b) => b[1].length - a[1].length);

        for (const [key, value] of sortedNewLines) {
            compareText += `<span class="changesHover" onclick="(() => copyText(\`${key}\`))();">${key}</span> <span class="arrow"> --&gt; </span> <span class="changesHover" onclick="(() => copyText(\`${value}\`))();">${value}</span><br><hr>`;
        }

        compareText += '<br><span style="font-size: 25px;">Zmienione ciągi:</span><br>';
        const sortedChangedLines = Object.entries(changed_lines)
            .sort((a, b) => b[1].length - a[1].length);

        for (const [key, value] of sortedChangedLines) {
            compareText += `<span class="arrow">${key}:</span> ${value}<br><hr>`;
        }

        compareText += '<br><span style="font-size: 25px;">Usunięte ciągi:</span><br>';
        const sortedRemovedLines = Object.entries(removed_lines)
            .sort((a, b) => b[1].length - a[1].length);

        for (const [key, value] of sortedRemovedLines) {
            compareText += `<span class="changesHover" onclick="(() => copyText(\`${key}\`))();">${key}</span> <span class="arrow"> --&gt; </span> <span class="changesHover" onclick="(() => copyText(\`${value}\`))();">${value}</span><br><hr>`;
        }
    }

    let compareDiv = document.createElement('div');
    compareDiv.innerHTML = `<span>${compareText}</span>`;
    document.getElementById("compare-results-container").appendChild(compareDiv);
}


function trackChanges() {
    document.getElementById("compare-results-container").innerHTML = '';
    let old_dict = {};
    let new_dict = {};
    if ((translations_java[document.getElementById("compare-version-1").value] && translations_java[document.getElementById("compare-version-2").value]) || (translations_bedrock[document.getElementById("compare-version-1").value] && translations_bedrock[document.getElementById("compare-version-2").value])) {
        let new_lines = find_new_lines(old_dict, new_dict);
        let changed_lines = find_changed_lines(old_dict, new_dict);
        let removed_lines = find_removed_lines(old_dict, new_dict);

        old_dict = parse_lines(translations_java[document.getElementById("compare-version-1").value], true);
        new_dict = parse_lines(translations_java[document.getElementById("compare-version-2").value], true);

        new_lines = find_new_lines(old_dict, new_dict);
        changed_lines = find_changed_lines(old_dict, new_dict, true);
        removed_lines = find_removed_lines(old_dict, new_dict);

        insert_changes(new_lines, changed_lines, removed_lines, true);

        console.log("Zmiany są wprowadzane do kodu");
    } else {
        let compareDiv = document.createElement('div');
        compareDiv.innerHTML = `<h3>Błąd: Brak wybranych wersji lub złe połączenie internetowe</h3>`;
        document.getElementById("compare-results-container").appendChild(compareDiv);
    }
}

function syncCompareOptions() {
    versionsSelect = java_vers; // Ваша змінна з версіями Java
    const version1Select = document.getElementById('compare-version-1');
    const version2Select = document.getElementById('compare-version-2');

    // Очищаємо попередні опції
    version1Select.innerHTML = '';
    version2Select.innerHTML = '';

    // Додаємо опцію "Версія"
    const defaultOption = document.createElement('option');
    defaultOption.text = "Wersja";
    defaultOption.value = ""; // Додаємо пусте значення
    version1Select.add(defaultOption);
    version2Select.add(defaultOption.cloneNode(true)); // Клон для другого select

    // Додаємо нові опції до select
    versionsSelect.forEach(function(version) {
        const option = document.createElement('option');
        option.text = version; // Текст опції
        option.value = version; // Значення опції
        version1Select.add(option);
        version2Select.add(option.cloneNode(true)); // Клон для другого select
    });

    // Вимкнути опцію, якщо потрібно
    if (version1Select.options.length > 1) {
        version1Select.options[1].disabled = true; // Вимкнути другу опцію
    }
    
    if (version2Select.options.length > 0) {
        version2Select.options[version2Select.options.length - 1].disabled = true; // Вимкнути останню опцію
    }
}

document.getElementById('compare-version-1').addEventListener('change', function() {
    this.options[0].disabled = true;
    const selectedValue = this.value;

    const selectedIndex = this.selectedIndex;

    // Розблокувати всі option в другому select
    for (let i = 0; i < document.getElementById('compare-version-2').options.length; i++) {
        document.getElementById('compare-version-2').options[i].disabled = false; // Спочатку розблокувати всі
    }

    // Заблокувати option з індексами вищими або рівними вибраному
    for (let i = selectedIndex; i < document.getElementById('compare-version-2').options.length; i++) {
        document.getElementById('compare-version-2').options[i].disabled = true; // Заблокувати
    }
});
document.getElementById('compare-version-2').addEventListener('change', function() {
    this.options[0].disabled = true;
    const selectedValue = this.value;
    const selectedIndex = this.selectedIndex;

    // Розблокувати всі option в другому select
    for (let i = 0; i < document.getElementById('compare-version-2').options.length; i++) {
        document.getElementById('compare-version-1').options[i].disabled = false; // Спочатку розблокувати всі
    }

    // Заблокувати option з індексами нижчими за вибраний
    for (let i = 0; i <= selectedIndex; i++) {
        document.getElementById('compare-version-1').options[i].disabled = true; // Заблокувати
    }
});

syncCompareOptions();
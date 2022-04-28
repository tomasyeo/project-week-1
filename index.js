const urlEsearch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const urlEsummary = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
//let apiKey = '7c47b28884ded2007c28466a9f9f2d92f808';

let paramsDefault = {
    //api_key: apiKey,    // Personal API key.
    db: 'pubmed',       // DB to query.
    usehistory: 'y',    // Set this to 'y' to use previously cache history.
    retmode: 'json',    // Set returned results to json. Default is xml.
    retmax: 0           // Set # of items to return. Use 0 for esearch.
};

// Wrapper.
async function searchPubMed(term, key_author, api_key) {
    console.log(term, key_author, api_key);

    paramsDefault.api_key = api_key;

    let searchParams = new URLSearchParams(paramsDefault);
    // Setup 1st param.
    searchParams.set('term', term);
    searchParams.set('sort', 'PublicationDate');

    console.log('Querying Esearch.');
    // Queries NCBI esearch for a search token pointing to the results.
    results = await queryNCBI(urlEsearch, searchParams);
    console.log(`webenv: ${results.esearchresult.webenv}`);

    // Setup 2nd param to retrieve publist summary.
    searchParams = new URLSearchParams(paramsDefault);
    searchParams.set('webenv', results.esearchresult.webenv);
    searchParams.set('query_key', results.esearchresult.querykey);
    searchParams.set('retmax', 1000);

    console.log('Querying Esummary.');
    // Queries NCBI esummary based on the token retrieved by esearch.
    results = await queryNCBI(urlEsummary, searchParams);
    
    // Process the resultset and populate the page.
    console.log('Processing.');
    processResults(results, key_author);
}


function fetchRequest(href, searchParams, method = 'GET') {
    let options = { method };
    let url = new URL(href);

    switch (method) {
        case 'GET':
            url.search = searchParams.toString();
            break;
        case 'POST':
            // KIV. Add this when time permits.
            throw new Error("Not implemented");
            break;
    }
    return fetch(url, options);
}

async function queryNCBI(url, searchParams) {
    // Make the async call to NCBI.
    let response = await fetchRequest(url, searchParams);
    if (response.ok) { // if HTTP-status is 200-299
        // Parse returned json dataset.
        result = await response.json();
        return result;
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

// Process the returned json object.
function processResults(results, key_author) {
    // Gwt a list of uids sorted by publication date.
    let uids = results.result.uids;
    let article;

    if ('content' in document.createElement('template')) {
        // Instantiate container with existing <ol> element
        // and <li> with the template
        var container = document.getElementById("pubmed");
        var template = document.getElementById('article');

        // Iterate through the resultset by UID.
        uids.forEach(uid => {
            article = results.result[uid];

            // Get the <li> in the template.
            var clone = template.content.cloneNode(true);
            li = clone.querySelector('li');
            li.id = uid;
            
            // Init the 3 predefined <span>.
            span = clone.querySelectorAll('span');
            spanTitle = span[0];
            spanAuthors = span[1];
            spanDOI = span[2];

            // Set title.
            spanTitle.innerHTML = htmlEnDeCode.htmlDecode(article['title']);
            // Set authors.
            spanAuthors.innerHTML = getAuthors(article['authors'], key_author);
            // Insert <a> into <span>.
            spanDOI.appendChild(getPublication(article));

            // Append a populated <li> into container.
            container.appendChild(clone);
        });
    } else {
        alert("Not supported.")
    }

    function getAuthors(authors, key_author) {
        // Get a list of authors. Highlight the key author.
        var authorArray = authors.map(author => {
            var pattern = new RegExp(key_author, 'i');
            return pattern.test(author['name']) ? "<mark>" + author['name'] + "</mark>" : author['name'];
        });
        // Return a concat string of authors.
        return authorArray.join(', ');
    }
    
    function getPublication(article) {
         // Create URL with NCBI id.
        var url = 'https://www.ncbi.nlm.nih.gov/pubmed/' + article['uid'];

        // elocation ID.
        var elocationid = article['elocationid'];

        // Journal details. 
        var journal = null;
        if (article['volume'] != "") {
            var issue = (article['issue'] != "") ? "(" + article['issue'] + ")" : "";
            var pages = (article['pages'] != "") ? ":" + article['pages'] : "";
            journal = article['volume'] + issue + pages;
        }

        // Publisher name.
        var source = "<em>" + article['source'] + "</em>";

        // Publish date.
        var pubdate = getPubDate(article['pubdate'], article['epubdate']);

        // PubMed ID.
        var pmid = "PMID: " + article['uid'];

        // Assemble text.
        displayText = [source, pubdate, journal, elocationid, pmid].filter(i => i != null).join('. ');

        // Return a populated <a> tag.
        return Object.assign(document.createElement('a'), { href: url, innerHTML: displayText, target: '_blank' });
    }

    // Choose between pubdate or epubdate.
    // Return epubdate if pubdate shows year.
    // Return pubdate if it cannot be parsed because of "year mth" format.
    function getPubDate(pubdate, epubdate) {
        pdate = Date.parse(pubdate);
        edate = Date.parse(epubdate);

        // return pubdate if it can't be parsed. eg. 2020 Mar is a valid date, but can't be parsed.
        if (isNaN(pdate)) {
            return pubdate;
        } else if (!isNaN(pdate)) {
            if (!isNaN(edate)) {
                return pdate >= edate ? pubdate : epubdate;
            } else { return pubdate; }
        }
    }
}

// Utilities --------------------------------------------------------------------------------------------
var htmlEnDeCode = (function () {
    var charToEntityRegex,
        entityToCharRegex,
        charToEntity,
        entityToChar;

    function resetCharacterEntities() {
        charToEntity = {};
        entityToChar = {};
        // add the default set
        addCharacterEntities({
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&quot;': '"',
            '&#39;': "'"
        });
    }

    function addCharacterEntities(newEntities) {
        var charKeys = [],
            entityKeys = [],
            key, echar;
        for (key in newEntities) {
            echar = newEntities[key];
            entityToChar[key] = echar;
            charToEntity[echar] = key;
            charKeys.push(echar);
            entityKeys.push(key);
        }
        charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
        entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
    }

    function htmlEncode(value) {
        var htmlEncodeReplaceFn = function (match, capture) {
            return charToEntity[capture];
        };

        return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
    }

    function htmlDecode(value) {
        var htmlDecodeReplaceFn = function (match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        };

        return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
    }

    resetCharacterEntities();

    return {
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
})();


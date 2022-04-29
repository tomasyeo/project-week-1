# project-week-1
## Querying PubMed 

This Javascript allows a user inject his/her/they/it/whatever publications by making asynchronous request 
to https://eutils.ncbi.nlm.nih.gov via REST API with a provided search term.

This simplified script use native Javascript API to make asynchronous calls to make integration into a web page simpler.

### Instructions

Add the following snippet into a HTML page. 
Place the HTML section where you want the list to display.

The Javascript section can be place in either the ```<header>``` or at the end of ```<body>```. Placement don't matter. 
The script will execute after the document is ready (or finished rendering).

##### For squarespace 
Add a code block and paste the following snippet into it. Set the code block to “HTML”, uncheck “display source”.

```html
    <!-- HTML section for injection. Place it anywhere in the page where you want to display the list. -->
    <ol id="pubmed">
    </ol>
    <template id="article">
        <li><span class="title"></span><span class="authors small"></span><span class="doi small"></span></li>
    </template>

    <!-- Javascript can be placed in the <header> or at the end of <body> -->
    <script src="pubmed_search.js"></script>
    <script>
        // PubMed NCBI querystring.
        let term = "Yeo, Tomas[Full Author Name]";
        // Initials of the author to highlight.
        let author = "Yeo T";
        // Using API key issued from pubmed.
        let apiKey = 'GetYourOwnAPIKeyFromPubMed';

        // Execute when document is ready.
        window.onload = () => {
            searchPubMed(term, author, apiKey);
        };
    </script>
```

The function *searchPubMed(querystring, author, apiKey)* takes three parameters.

- *querystring*: A valid PubMed querystring. Build and test the querystring from https://www.ncbi.nlm.nih.gov/pubmed.

- *author*: the author’s initials to highlight. The initial MUST MATCH ones used in the publications. Input is 
case-insensitive. For multiple initials, append pipe ‘|’ after each initials. Example: fidock da|fidock d

- *apiKey*: An API key issued by PubMed. Users can obtain an API key now from the Settings page of their NCBI account 
 (to create an account, visit http://www.ncbi.nlm.nih.gov/account/). After creating the key, users should include it 
 in each E-utility request by assigning it to the new api_key parameter. 
 (from https://www.ncbi.nlm.nih.gov/books/NBK25497/)

The articles are sorted by publication date by default. 

### Caveats
- The query script pulls the list of articles from PubMed NCBI based on your querystring. All information is provided 
as-is from PubMed.
- Recent articles such as ones that are recently submitted or in-press may not show up on PubMed. 
Give the database some time to update its repository.
- Check your querystring thoroughly if there are articles omitted, or that are not yours. 
It is your prerogative to fine tune the querystring on PubMed NCBI.

### About squarespace template
Some templates has AJAX turned on by default. Javascript injection script will fail to work after page render. 
Turning off AJAX will solve the issue. https://support.squarespace.com/hc/en-us/articles/115000253288-Ajax-loading

### Questions? 
Ask Google.
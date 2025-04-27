# Jerry The Bard - D&D Inspired AI companion
![Jerry Art](CLIENT/img/character/default.png)

### Hoe werkt deze AI?

Jerry is een AI bot die je vragen kan stellen
over zijn avonturen en jou ook ziet als een
goede vriend. In de text field kan je een bericht
typen en als je op de 'submit' knop drukt word dit
verstuurd naar de AI (Jerry).

### Installatie
Om lokaal dit project te openen heb je een aantal installaties in de node modules nodig. Deze kan je met onderstaande snippet downloaden in de terminal:

```
npm init -y
npm install langchain @langchain/core @langchain/openai
npm install express
npm install cors
```

Om dit project te draaien moet je eerst de server aanzetten. Dit kan je doen door deze code snippet
te gebruiken in de terminal:

```
cd SERVER
node --env-file=.env --watch server.js
```


vervolgens zou je moeten kunnen chatten met Jerry in de
client door het HTML bestand te openen in je browser.

### Chat History
De chat history word lokaal bijgehouden in de browser. Je kan
je chathistory terugzien of verwijderen in localstorage
(CTRL + SHIFT + I → application → localstorage).
# GUIDE DE CONTRIBUTION / CONTRIBUTING GUIDE
[Français](https://github.com/LINCnil/pia/blob/master/CONTRIBUTING.md#fr) / [English](https://github.com/LINCnil/pia/blob/master/CONTRIBUTING.md#en)

## FR
Participer à l’amélioration de l’application PIA peut se faire de nombreuses façons différentes : remonter un bug, proposer une nouvelle fonctionnalité, corriger des contenus, améliorer la documentation, etc. Toute contribution est la bienvenue et les modalités de participation sont décrites ci-dessous. 

###	Workflow
Le projet s’inscrit dans une démarche ouverte de gestion et de workflow. En ce sens, nous encourageons grandement toute proposition à se faire au travers des repositories du projet afin que cela soit accessible publiquement et que chacun puisse s’exprimer et aider la communauté. La gestion des contributions se fait au travers de trois grandes étapes :
1.	l’expression d’un besoin ou d’un problème ;
2.	la proposition d’une réponse concrète ;
3.	l’évaluation et intégration des contributions.

###	Exprimer un besoin ou problème
Pour toute remontée de bug (e.g. fonctionnalité non fonctionnelle, message d’erreur, crash, etc.), demande d’aide, remarque d’ordre général (e.g. correction du contenu, accessibilité, aide pour l’installation, etc.) ou proposition d’idée pour améliorer l’outil (e.g. nouvelle fonctionnalité, évolution du design, ajout de contenus, etc.), vous devez ouvrir une issue  dans le repository adéquat. 
Les issues sont particulièrement importantes pour documenter les discussions et décisions prises pour l’évolution de l’outil. En effet, chaque issue ouverte sera discutée par la communauté pour l’évaluer et décider de son importance et de la solution la plus pertinente à y apporter. En fonction des discussions, les modérateurs les reporteront dans la roadmap publique afin de faciliter la contribution à l’outil. 
####	Remonter un bug
Pour soumettre un rapport de bug, merci de sélectionner le template correspondant lors de la création d'une nouvelle issue. Ce template demande les informations suivantes :
```
- Description du bug 
- Description des étapes pour le reproduire :
- Comportement attendu : 
- Version de l’outil :
- Navigateur (si applicable) :
- Système d’exploitation :
```

Vous pouvez également inclure des captures d’écran à votre issue si vous considérez que cela permet de mieux illustrer le problème que vous rencontrez.
#### Informer de la découverte de vulnérabilités
Dans le cas où vous avez découvert une vulnérabilité au sein de l’outil, merci de nous la remonter aussi rapidement que possible à outil-pia@cnil.fr. 
#### Faire part d’une idée ou demander de nouvelles fonctionnalités
Pour demander l’implémentation d’une nouvelle fonctionnalité, merci de sélectionner le template correspondant lors de la création d'une nouvelle issue. Ce template demande les informations suivantes :
```
-	Description de la fonctionnalité :
-	Problème ou besoin auquel la fonctionnalité répond :
-	Exemple d’une fonctionnalité similaire dans d’autres produits / services :
```

Les éléments visuels (mockups, démo visuelle, etc.) sont les bienvenus et permettent de fluidifier la communication autour des demandes de nouvelles fonctionnalités. 

###	Proposer une contribution au travers de pull request
Toute modification apportée au code source du projet, pour répondre aux éléments mis en avant au travers des issues et de la roadmap, passe nécessairement par une pull request. 

Avant de vous lancer dans une contribution, veillez à vous synchroniser avec les autres contributeurs en consultant la roadmap ou la liste des personnes s’étant assignées à une issue. Cela vous évitera de refaire un travail déjà commencé par ailleurs ou de voir une de vos pull requests refusée. Inversement, merci d’informer les autres contributeurs lorsque vous initiez un travail sur l’une des issues.

Dans un premier temps, faire un fork du repository concerné et créer une branche de fonctionnalité. Cette branche doit suivre la nomenclature suivante : **issueXX-NomDeLaBranche**  où XX correspond au numéro de l’issue à laquelle vous proposez une solution. 

Une fois les modifications terminées sur votre fork, créez une pull request au niveau de la branch latest du repository LINCnil. 

Bonnes pratiques  : 
-	**commit message** : les commit messages devraient adopter une formulation concise (environ 50 caractères) des modifications apportées ;
-	**unité** : il est préférable de faire une pull request par nouvelle fonction développée ;
-	**clarifier** : toute pull request devrait être accompagnée d’une description claire et précise des modifications effectuées ;
-	**documenter** : toute pull request devrait être accompagnée d’une documentation ou de modifications à la documentation existante adéquates ;
-	**commenter** : tout développement devrait être correctement commenté au sein du code source afin d’en faciliter la lisibilité et compréhension par les autres contributeurs ;
-	**compatibilité de licence** :  tout nouveau développement doit être fait sous une licence compatible avec celle utilisée initialement par l’outil (GPL v.3).

### Évaluation et intégration
Une fois une pull request soumise, l’ensemble de la communauté a le droit de l’évaluer, de vous poser des questions sur les modifications effectuées, de vous proposer des améliorations ou bien de vous demander des changements.
Seuls les modérateurs de la branche latest sont en capacité d’accepter et de merger votre pull request. Ceux-ci pourront vous faire des demandes en lien avec les bonnes pratiques mises en avant ci-dessus. 

###	Crédits   
L’ensemble des contributeurs est listé dans le fichier AUTHOR  du repository correspondant. Merci de ne pas vous ajouter manuellement dans ce fichier, les modérateurs veillent à ce que celui-ci soit à jour en se basant sur l’historique de contribution du repository. Par ailleurs, les informations ci-dessous sont nécessaires pour les crédits :
-	nom civil ou d’emprunt ;
-	adresse email et/ou lien vers le profil Github.




## EN
Anyone can participate towards improving the PIA application in several different ways: sending a bug report, suggesting new functions, correcting content, improving documentation, etc. All contributions are welcome and the terms for participation are described below. 
###	Workflow
The project is centred around an open approach to management and workflow. To this end, we strongly encourage that all proposals are made through the project repositories so that they are publicly accessible and so that every member can express themselves and help the community. Contributions are managed through three main stages:
1.	expressing a requirement or an issue;
2.	proposing a concrete solution;
3.	assessing and integrating contributions.

###	Expressing a requirement or an issue
For all bug reports (e.g. non-functional features, error messages, crashes, etc.), help requests, general remarks (e.g. content correction, accessibility, installation support, etc.) or idea proposals to improve the tool (e.g. new features, development of the design, adding content, etc.), you must open an issue in the appropriate repository. 
Issues are particularly important to document the discussions and decisions taken to develop the tool. Indeed, each issue opened will be discussed by the community in order to assess and determine its importance and which solution is most appropriate. Based on discussions, moderators will transfer issues to the public roadmap to facilitate contributions to the tool. 

#### Reporting bugs
To submit a bug report, please use the corresponding template proposed when you want to create a new issue. The template asks for the following information:
```
- Description of the bug and of stages to reproduce the bug:
- Steps to reproduce the behavior:
- Expected behavior : 
- Tool version:
- Browser (if applicable):
- Operating system: 
```

You may also attach screenshots with your issue if you consider that this provides a better illustration of the issue you are encountering.

#### Notifications relating to the discovery of vulnerabilities
Should you discover a vulnerability within the tool, please report this vulnerability as soon as possible to outil-pia@cnil.fr. 

#### Sharing an idea or requesting new features
To request the implementation of a new feature, please use the corresponding template proposed when you want to create a new issue. The template asks for the following information:
```
-	Description of the feature:
-	Issue or requirement solved by the feature:
-	Example of a similar feature in other products/services:
```

Visual elements (mock-ups, visual demo, etc.) are welcome and allow a more free-flowing communication on new feature requests. 

###	Proposing contributions through a pull request
Any changes made to the project’s source code in response to any aspects highlighted by issues and the roadmap, must necessarily be the subject of a pull request. 

Before making a contribution, please ensure that you are in sync with other contributions by consulting the roadmap or the list of individuals assigned to an issue. This will avoid repeating work that has already been started elsewhere and avoid one of your pull requests being refused. Conversely, please inform other contributors when starting work on one of the issues.

Before anything else, create a fork of the repository in question and create a feature branch. This branch must be named as follows: **issueXX-NameOfBranch** in which XX is the number of the issue for which you are proposing a solution. 

Once the changes have been made on your fork, create a pull request in the latest branch of the LINCnil repository. 

Good practices:
-	**commit messages**: commit messages should describe any changes made in a concise manner (approximately 50 characters);
-	**unity**: we recommend creating one pull request per new function developed;
-	**clarify**: all pull requests should be accompanied by a clear and precise description of any changes made;
-	**document**: all pull requests should be accompanied by appropriate documentation or by appropriate changes to already existing documentation;
-	**comment**: all developments should be properly commented within the source code in order to facilitate readability and understanding by other contributors.
-	**licence compatibility**: all new developments must be carried out under a licence that is compatible with the licence initially used by the tool (GPL v.3).

### Assessing and integrating
Once a pull request has been submitted, the entire community is entitled to assess the changes, to ask questions on any changes made, to propose improvements or to request changes.
Only moderators from the latest branch are able to accept and to merge your pull request. These moderators may send you requests based on the good practices set out above. 

### Credits
All contributors are listed in the corresponding repository’s AUTHOR file. Please do not add your name to this file manually, moderators ensure that this file is up-to-date using the repository’s contribution history. Furthermore, the following information is required for credits:
-	civil name or alias;
-	e-mail address and/or link to Github profile.
